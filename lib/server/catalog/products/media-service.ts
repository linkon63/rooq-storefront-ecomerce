import "server-only";
import { prisma } from "@/lib/server/prisma";
import { badRequest, notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { mediaRefSelect } from "@/lib/server/media/select";
import { toLegacyMedia } from "@/utils/mappers/product-detail";
import { releaseMedia } from "@/lib/server/media/release";
import type { Tx } from "../selects";
import type { ProductMediaInput, ProductMediaUpdateInput } from "./schemas";

const productMediaSelect = {
  id: true,
  mediaId: true,
  colorId: true,
  position: true,
  isPrimary: true,
  media: { select: mediaRefSelect },
} as const;

async function assertProduct(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) throw notFound(ERROR_MESSAGES.product.notFound(productId));
}

async function assertColor(colorId: string | null | undefined): Promise<void> {
  if (!colorId) return;
  const color = await prisma.color.findUnique({ where: { id: colorId }, select: { id: true } });
  if (!color) throw badRequest(ERROR_MESSAGES.color.notFound(colorId));
}

/** One primary per colour gallery (shared images count as their own gallery). */
async function clearPrimary(tx: Tx, productId: string, colorId: string | null, exceptId?: string): Promise<void> {
  await tx.productMedia.updateMany({
    where: { productId, colorId, isPrimary: true, ...(exceptId ? { id: { not: exceptId } } : {}) },
    data: { isPrimary: false },
  });
}

export async function listProductMedia(productId: string) {
  await assertProduct(productId);
  const rows = await prisma.productMedia.findMany({ where: { productId }, select: productMediaSelect, orderBy: { position: "asc" } });
  return rows.map(toLegacyMedia);
}

export async function addProductMedia(productId: string, input: ProductMediaInput) {
  await Promise.all([assertProduct(productId), assertColor(input.colorId)]);
  const row = await prisma.$transaction(async (tx) => {
    const last = await tx.productMedia.aggregate({ where: { productId }, _max: { position: true } });
    const colorId = input.colorId ?? null;
    if (input.isPrimary) await clearPrimary(tx, productId, colorId);
    if (input.alt) await tx.media.update({ where: { id: input.mediaId }, data: { alt: input.alt } });
    return tx.productMedia.upsert({
      where: { productId_mediaId: { productId, mediaId: input.mediaId } },
      create: {
        productId,
        mediaId: input.mediaId,
        colorId,
        isPrimary: input.isPrimary ?? false,
        position: input.position ?? (last._max.position ?? -1) + 1,
      },
      update: { colorId, ...(input.isPrimary !== undefined ? { isPrimary: input.isPrimary } : {}) },
      select: productMediaSelect,
    });
  });
  return toLegacyMedia(row);
}

export async function updateProductMedia(id: string, input: ProductMediaUpdateInput) {
  const existing = await prisma.productMedia.findUnique({ where: { id }, select: { productId: true, colorId: true, mediaId: true } });
  if (!existing) throw notFound(ERROR_MESSAGES.product.mediaNotFound(id));
  await assertColor(input.colorId);
  const row = await prisma.$transaction(async (tx) => {
    const colorId = input.colorId === undefined ? existing.colorId : input.colorId;
    if (input.isPrimary) await clearPrimary(tx, existing.productId, colorId, id);
    if (input.alt !== undefined) await tx.media.update({ where: { id: existing.mediaId }, data: { alt: input.alt } });
    return tx.productMedia.update({
      where: { id },
      data: {
        ...(input.colorId !== undefined ? { colorId: input.colorId } : {}),
        ...(input.position !== undefined ? { position: input.position } : {}),
        ...(input.isPrimary !== undefined ? { isPrimary: input.isPrimary } : {}),
      },
      select: productMediaSelect,
    });
  });
  return toLegacyMedia(row);
}

/** Removes the gallery link; the image itself goes too when nothing else uses it. */
export async function removeProductMedia(id: string) {
  const existing = await prisma.productMedia.findUnique({ where: { id }, select: { mediaId: true } });
  if (!existing) throw notFound(ERROR_MESSAGES.product.mediaNotFound(id));
  await prisma.$transaction(async (tx) => {
    await tx.productMedia.delete({ where: { id } });
    await releaseMedia(existing.mediaId, tx);
  });
  return { message: SUCCESS_MESSAGES.common.deleted("Product media") };
}

export async function reorderProductMedia(productId: string, items: { id: string; position: number }[]) {
  await assertProduct(productId);
  const owned = await prisma.productMedia.count({ where: { productId, id: { in: items.map((item) => item.id) } } });
  if (owned !== new Set(items.map((item) => item.id)).size) throw badRequest(ERROR_MESSAGES.common.notFound);
  await prisma.$transaction(items.map((item) => prisma.productMedia.update({ where: { id: item.id }, data: { position: item.position } })));
  return listProductMedia(productId);
}
