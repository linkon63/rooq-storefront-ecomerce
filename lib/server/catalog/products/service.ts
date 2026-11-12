import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";
import { badRequest, notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { CATALOG_TX_OPTIONS } from "@/lib/constants/catalog";
import { slugify } from "@/utils/slug";
import { assertIdsExist, assertProductRefs } from "../references";
import type { Tx } from "../selects";
import { getProductById } from "./detail";
import type { ProductCreateInput, ProductUpdateInput } from "./schemas";

type Scalars = Omit<ProductCreateInput, "tagIds" | "attributeValueIds" | "collectionIds">;

async function assertLinks(db: Tx, input: ProductUpdateInput): Promise<void> {
  await assertProductRefs(db, input);
  await Promise.all([
    assertIdsExist((ids) => db.tag.count({ where: { id: { in: ids } } }), input.tagIds, ERROR_MESSAGES.tag.someNotFound),
    assertIdsExist(
      (ids) => db.attributeValue.count({ where: { id: { in: ids } } }),
      input.attributeValueIds,
      ERROR_MESSAGES.attribute.someValuesNotFound,
    ),
    assertIdsExist((ids) => db.collection.count({ where: { id: { in: ids } } }), input.collectionIds, ERROR_MESSAGES.collection.someNotFound),
  ]);
}

/** Replaces the product's collection membership, appending to the end of newly joined collections. */
async function syncCollections(tx: Tx, productId: string, collectionIds: string[]): Promise<void> {
  const wanted = [...new Set(collectionIds)];
  await tx.collectionProduct.deleteMany({ where: { productId, collectionId: { notIn: wanted } } });
  const existing = await tx.collectionProduct.findMany({ where: { productId }, select: { collectionId: true } });
  const have = new Set(existing.map((row) => row.collectionId));
  for (const collectionId of wanted.filter((id) => !have.has(id))) {
    const last = await tx.collectionProduct.aggregate({ where: { collectionId }, _max: { position: true } });
    await tx.collectionProduct.create({ data: { collectionId, productId, position: (last._max.position ?? -1) + 1 } });
  }
}

async function syncAttributes(tx: Tx, productId: string, valueIds: string[]): Promise<void> {
  await tx.productAttributeValue.deleteMany({ where: { productId } });
  if (valueIds.length) {
    await tx.productAttributeValue.createMany({
      data: [...new Set(valueIds)].map((attributeValueId) => ({ productId, attributeValueId })),
      skipDuplicates: true,
    });
  }
}

function scalarData(input: Partial<Scalars>): Prisma.ProductUncheckedUpdateInput {
  const { slug, ...rest } = input;
  return { ...rest, ...(slug ? { slug } : {}) };
}

export async function createProduct(input: ProductCreateInput) {
  await assertLinks(prisma, input);
  const { tagIds, attributeValueIds, collectionIds, ...scalars } = input;
  const slug = scalars.slug ?? slugify(scalars.name);
  if (!slug) throw badRequest(ERROR_MESSAGES.validation.invalidSlug);
  const publishedAt = scalars.publishedAt ?? (scalars.status === "active" ? new Date() : null);

  const id = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        ...(scalarData(scalars) as Prisma.ProductUncheckedCreateInput),
        name: scalars.name,
        slug,
        price: scalars.price,
        brandId: scalars.brandId,
        categoryId: scalars.categoryId,
        publishedAt,
        tags: tagIds?.length ? { connect: tagIds.map((tagId) => ({ id: tagId })) } : undefined,
      },
      select: { id: true },
    });
    if (attributeValueIds?.length) await syncAttributes(tx, product.id, attributeValueIds);
    if (collectionIds?.length) await syncCollections(tx, product.id, collectionIds);
    return product.id;
  }, CATALOG_TX_OPTIONS);
  return getProductById(id, { admin: true });
}

export async function updateProduct(id: string, input: ProductUpdateInput) {
  const current = await prisma.product.findUnique({ where: { id }, select: { id: true, status: true, publishedAt: true } });
  if (!current) throw notFound(ERROR_MESSAGES.product.notFound(id));
  await assertLinks(prisma, input);
  const { tagIds, attributeValueIds, collectionIds, ...scalars } = input;
  const becomesActive = scalars.status === "active" && !current.publishedAt && scalars.publishedAt === undefined;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...scalarData(scalars),
        ...(becomesActive ? { publishedAt: new Date() } : {}),
        ...(tagIds ? { tags: { set: tagIds.map((tagId) => ({ id: tagId })) } } : {}),
      },
    });
    if (attributeValueIds) await syncAttributes(tx, id, attributeValueIds);
    if (collectionIds) await syncCollections(tx, id, collectionIds);
  }, CATALOG_TX_OPTIONS);
  return getProductById(id, { admin: true, includeArchived: true });
}

/** Soft delete: archived products leave the shop but keep their order history. */
export async function archiveProduct(id: string) {
  const current = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!current) throw notFound(ERROR_MESSAGES.product.notFound(id));
  await prisma.product.update({ where: { id }, data: { archivedAt: new Date(), status: "inactive" } });
  return { message: SUCCESS_MESSAGES.common.deleted("Product") };
}

/** Brings an archived product back as a draft (admin "restore"). */
export async function restoreProduct(id: string) {
  const current = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!current) throw notFound(ERROR_MESSAGES.product.notFound(id));
  await prisma.product.update({ where: { id }, data: { archivedAt: null, status: "draft" } });
  return getProductById(id, { admin: true });
}
