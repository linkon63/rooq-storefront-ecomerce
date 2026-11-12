import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";
import { badRequest, conflict, notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { mediaRefSelect } from "@/lib/server/media/select";
import { slugify } from "@/utils/slug";
import { createsCycle } from "@/utils/catalog/category-tree";
import { toCategoryResponse } from "@/utils/mappers/category";
import { releaseMedia } from "@/lib/server/media/release";
import { resolveMediaRef } from "../media";
import { loadCategoryNodes } from "./nodes";
import { applyCategoryReorder } from "./reorder";
import type { CategoryCreateInput, CategoryReorderInput, CategoryUpdateInput } from "./schemas";

const categorySelect = {
  id: true, name: true, slug: true, description: true, sortOrder: true, isActive: true, metaTitle: true, metaDescription: true,
  parentId: true, sizeChartId: true, imageMediaId: true, createdAt: true, updatedAt: true,
  imageMedia: { select: mediaRefSelect },
  _count: { select: { products: true, children: true } },
} as const satisfies Prisma.CategorySelect;

const byOrder = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

/** GET /category — root categories with two levels of children (the old tree). */
export async function listCategoryTree() {
  const rows = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: byOrder,
    select: {
      ...categorySelect,
      children: { orderBy: byOrder, select: { ...categorySelect, children: { orderBy: byOrder, select: categorySelect } } },
    },
  });
  return rows.map(toCategoryResponse);
}

export async function getCategory(id: string) {
  const row = await prisma.category.findUnique({ where: { id }, select: categorySelect });
  if (!row) throw notFound(ERROR_MESSAGES.category.notFound(id));
  return toCategoryResponse(row);
}

async function assertParent(id: string | null, parentId: string | null | undefined) {
  if (!parentId) return;
  const parent = await prisma.category.findUnique({ where: { id: parentId }, select: { id: true } });
  if (!parent) throw badRequest(ERROR_MESSAGES.category.parentNotFound(parentId));
  if (id && createsCycle(await loadCategoryNodes(), id, parentId)) throw badRequest(ERROR_MESSAGES.category.cycle);
}

async function assertSlugFree(slug: string, exceptId?: string) {
  const clash = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
  if (clash && clash.id !== exceptId) throw conflict(ERROR_MESSAGES.category.slugExists(slug));
}

function data(input: CategoryUpdateInput, imageMediaId: string | null | undefined) {
  const rest = { ...input };
  delete rest.imageUrl;
  delete rest.imageMediaId;
  return { ...rest, ...(imageMediaId !== undefined ? { imageMediaId } : {}) };
}

/** `uploadedMediaId` = id of an image file sent in the same multipart request. */
export async function createCategory(input: CategoryCreateInput, uploadedMediaId?: string) {
  const slug = input.slug ?? slugify(input.name);
  await Promise.all([assertParent(null, input.parentId), assertSlugFree(slug)]);
  const imageMediaId = uploadedMediaId ?? (await resolveMediaRef({ url: input.imageUrl || undefined, mediaId: input.imageMediaId }));
  const row = await prisma.category.create({ data: { ...data(input, imageMediaId), name: input.name, slug }, select: categorySelect });
  return toCategoryResponse(row);
}

export async function updateCategory(id: string, input: CategoryUpdateInput, uploadedMediaId?: string) {
  const current = await prisma.category.findUnique({ where: { id }, select: { imageMediaId: true } });
  if (!current) throw notFound(ERROR_MESSAGES.category.notFound(id));
  if (input.parentId === id) throw badRequest(ERROR_MESSAGES.category.ownParent(id));
  await Promise.all([assertParent(id, input.parentId), input.slug ? assertSlugFree(input.slug, id) : null]);
  const imageMediaId = uploadedMediaId ?? (await resolveMediaRef({ url: input.imageUrl, mediaId: input.imageMediaId }));

  const row = await prisma.$transaction(async (tx) => {
    const updated = await tx.category.update({ where: { id }, data: data(input, imageMediaId), select: categorySelect });
    if (imageMediaId !== undefined && current.imageMediaId && current.imageMediaId !== imageMediaId) {
      await releaseMedia(current.imageMediaId, tx);
    }
    return updated;
  });
  return toCategoryResponse(row);
}

export async function reorderCategories(input: CategoryReorderInput) {
  await applyCategoryReorder(input);
  return listCategoryTree();
}

/** Hard delete (old behaviour) — refused while sub-categories or products still point at it. */
export async function removeCategory(id: string) {
  const category = await prisma.category.findUnique({ where: { id }, select: categorySelect });
  if (!category) throw notFound(ERROR_MESSAGES.category.notFound(id));
  if (category._count.children > 0) throw conflict(ERROR_MESSAGES.category.hasChildren);
  if (category._count.products > 0) throw conflict(ERROR_MESSAGES.database.foreignKeyDelete("category"));
  await prisma.$transaction(async (tx) => {
    await tx.category.delete({ where: { id } });
    await releaseMedia(category.imageMediaId, tx);
  });
  return toCategoryResponse(category);
}
