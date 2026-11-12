import "server-only";
import { prisma } from "@/lib/server/prisma";
import { badRequest, forbidden, notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { CATALOG_TX_OPTIONS } from "@/lib/constants/catalog";
import { slugify } from "@/utils/slug";
import { buildPaginationMeta, pageWindow } from "@/utils/pagination";
import { cardsInOrder, toCollectionSummary, toLook } from "@/utils/mappers/collection";
import { assertIdsExist } from "../references";
import { resolveMediaRef } from "../media";
import type { Tx } from "../selects";
import { loadCategoryNodes } from "../categories/nodes";
import { buildProductFilters } from "../products/filters";
import { productFacets } from "../products/facets";
import { cardMap, collectionSelect, loadLooks, publicCollectionWhere } from "./queries";
import type { CollectionCreateInput, CollectionDetailQuery, CollectionListQuery, CollectionUpdateInput } from "./schemas";

function assertWindow(startsAt: Date | null | undefined, endsAt: Date | null | undefined) {
  if (startsAt && endsAt && endsAt <= startsAt) throw badRequest(ERROR_MESSAGES.collection.invalidWindow);
}

async function setProducts(tx: Tx, collectionId: string, productIds: string[]) {
  await tx.collectionProduct.deleteMany({ where: { collectionId } });
  const ids = [...new Set(productIds)];
  if (ids.length) await tx.collectionProduct.createMany({ data: ids.map((productId, position) => ({ collectionId, productId, position })) });
}

export async function listCollections(query: CollectionListQuery, isStaff: boolean) {
  const admin = query.scope === "admin";
  if (admin && !isStaff) throw forbidden(ERROR_MESSAGES.auth.insufficientRole);
  const rows = await prisma.collection.findMany({
    where: {
      ...(admin ? {} : publicCollectionWhere(new Date())),
      ...(query.type ? { type: query.type } : {}),
      ...(query.featured ? { isFeatured: true } : {}),
      ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
    },
    select: collectionSelect,
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toCollectionSummary);
}

/** GET /collections/slug/:slug — the shop page: products by position (paginated) + looks. */
export async function getCollectionBySlug(slug: string, query: CollectionDetailQuery) {
  const collection = await prisma.collection.findFirst({ where: { slug, ...publicCollectionWhere(new Date()) }, select: collectionSelect });
  if (!collection) throw notFound(ERROR_MESSAGES.collection.notFoundBySlug(slug));
  const { page, limit, skip, take } = pageWindow(query.page, query.limit);
  const where = { collectionId: collection.id, product: { status: "active" as const, archivedAt: null } };

  const [links, total, looks, categories] = await Promise.all([
    prisma.collectionProduct.findMany({ where, select: { productId: true }, orderBy: [{ position: "asc" }, { createdAt: "asc" }], skip, take }),
    prisma.collectionProduct.count({ where }),
    loadLooks(collection.id),
    query.facets ? loadCategoryNodes() : Promise.resolve(null),
  ]);
  const pageIds = links.map((link) => link.productId);
  const [cards, facets] = await Promise.all([
    cardMap([...pageIds, ...looks.flatMap((look) => look.items.map((item) => item.productId))]),
    categories ? productFacets(buildProductFilters({ collection: slug }, { now: new Date(), admin: false, categories }), categories) : null,
  ]);

  return {
    ...toCollectionSummary(collection),
    metaTitle: collection.metaTitle,
    metaDescription: collection.metaDescription,
    products: cardsInOrder(pageIds, cards),
    meta: buildPaginationMeta({ page, limit, total }),
    looks: looks.map((look) => toLook(look, cards)),
    ...(facets ? { facets } : {}),
  };
}

/** GET /collections/:id (admin) — includes the ordered productIds for the editor. */
export async function getCollectionAdmin(id: string) {
  const collection = await prisma.collection.findUnique({
    where: { id },
    select: { ...collectionSelect, products: { select: { productId: true }, orderBy: { position: "asc" } } },
  });
  if (!collection) throw notFound(ERROR_MESSAGES.collection.notFound(id));
  const productIds = collection.products.map((p) => p.productId);
  const looks = await loadLooks(id);
  const cards = await cardMap([...productIds, ...looks.flatMap((look) => look.items.map((item) => item.productId))]);
  return {
    ...toCollectionSummary(collection),
    metaTitle: collection.metaTitle,
    metaDescription: collection.metaDescription,
    productIds,
    products: cardsInOrder(productIds, cards),
    looks: looks.map((look) => toLook(look, cards)),
  };
}

async function writeCollection(id: string | null, input: CollectionUpdateInput) {
  assertWindow(input.startsAt, input.endsAt);
  await assertIdsExist((ids) => prisma.product.count({ where: { id: { in: ids } } }), input.productIds, ERROR_MESSAGES.product.someNotFound);
  const coverMediaId = await resolveMediaRef({ url: input.coverImageUrl, mediaId: input.coverMediaId });
  const { productIds, ...fields } = input;
  delete fields.coverImageUrl;
  delete fields.coverMediaId;
  const data = { ...fields, ...(coverMediaId !== undefined ? { coverMediaId } : {}) };

  return prisma.$transaction(async (tx) => {
    const saved = id
      ? await tx.collection.update({ where: { id }, data, select: { id: true } })
      : await tx.collection.create({
          data: { ...data, name: fields.name ?? "", slug: fields.slug ?? slugify(fields.name ?? "") },
          select: { id: true },
        });
    if (productIds) await setProducts(tx, saved.id, productIds);
    return saved.id;
  }, CATALOG_TX_OPTIONS);
}

export async function createCollection(input: CollectionCreateInput) {
  return getCollectionAdmin(await writeCollection(null, input));
}

export async function updateCollection(id: string, input: CollectionUpdateInput) {
  const exists = await prisma.collection.findUnique({ where: { id }, select: { startsAt: true, endsAt: true } });
  if (!exists) throw notFound(ERROR_MESSAGES.collection.notFound(id));
  assertWindow(input.startsAt === undefined ? exists.startsAt : input.startsAt, input.endsAt === undefined ? exists.endsAt : input.endsAt);
  return getCollectionAdmin(await writeCollection(id, input));
}

export async function removeCollection(id: string) {
  const exists = await prisma.collection.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw notFound(ERROR_MESSAGES.collection.notFound(id));
  await prisma.collection.delete({ where: { id } });
  return { message: SUCCESS_MESSAGES.common.deleted("Collection") };
}
