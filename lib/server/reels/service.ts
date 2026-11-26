import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { MAX_REEL_BYTES, MAX_REEL_MB, REEL_MIME } from "@/lib/constants/reels";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { badRequest, notFound, payloadTooLarge, unsupportedMediaType } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import type { AdminReel } from "@/types/admin/reel";
import { isMp4, reelVideoUrl } from "@/utils/reel";
import type { ReelUpdateInput } from "./schemas";

const reelSelect = {
  id: true,
  position: true,
  isActive: true,
  sizeBytes: true,
  product: { select: { id: true, name: true, slug: true, status: true } },
} as const;

type ReelRow = Omit<AdminReel, "videoUrl">;

const toReel = (row: ReelRow): AdminReel => ({ ...row, videoUrl: reelVideoUrl(row.id) });

async function assertProduct(productId: string) {
  const found = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!found) throw notFound(ERROR_MESSAGES.reel.productNotFound(productId));
}

async function assertReel(id: string) {
  const found = await prisma.reel.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw notFound(ERROR_MESSAGES.reel.notFound(id));
}

/** Every reel in order (admin), or only active ones with an active product (storefront). */
export async function listReels({ activeOnly = false, limit }: { activeOnly?: boolean; limit?: number } = {}) {
  const rows = await prisma.reel.findMany({
    where: activeOnly ? { isActive: true, product: { status: "active" } } : undefined,
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    take: limit,
    select: reelSelect,
  });
  return rows.map(toReel);
}

/** Stores an MP4 and adds it as the last reel. */
export async function createReel(file: File, productId: string) {
  if (file.size > MAX_REEL_BYTES) throw payloadTooLarge(ERROR_MESSAGES.reel.tooLarge(MAX_REEL_MB));
  const data = new Uint8Array(await file.arrayBuffer());
  if (!isMp4(data)) throw unsupportedMediaType(ERROR_MESSAGES.reel.notMp4);
  await assertProduct(productId);
  const last = await prisma.reel.aggregate({ _max: { position: true } });
  const row = await prisma.reel.create({
    data: {
      productId,
      position: (last._max.position ?? -1) + 1,
      mimeType: REEL_MIME,
      sizeBytes: data.byteLength,
      blob: { create: { data } },
    },
    select: reelSelect,
  });
  return toReel(row);
}

export async function updateReel(id: string, input: ReelUpdateInput) {
  await assertReel(id);
  if (input.productId) await assertProduct(input.productId);
  return toReel(await prisma.reel.update({ where: { id }, data: input, select: reelSelect }));
}

export async function deleteReel(id: string) {
  await assertReel(id);
  await prisma.reel.delete({ where: { id } });
  return { message: SUCCESS_MESSAGES.reel.deleted };
}

/** Saves a new order; the list must hold every reel exactly once. */
export async function reorderReels(ids: readonly string[]) {
  const current = await prisma.reel.findMany({ select: { id: true } });
  const known = new Set(current.map((row) => row.id));
  if (ids.length !== known.size || new Set(ids).size !== ids.length || ids.some((id) => !known.has(id))) {
    throw badRequest(ERROR_MESSAGES.reel.reorderMismatch);
  }
  await prisma.$transaction(ids.map((id, position) => prisma.reel.update({ where: { id }, data: { position } })));
  return listReels();
}

/** The stored bytes, for the public video route. */
export async function getReelVideo(id: string) {
  const row = await prisma.reel.findUnique({ where: { id }, select: { mimeType: true, blob: { select: { data: true } } } });
  if (!row?.blob) throw notFound(ERROR_MESSAGES.reel.notFound(id));
  return { mimeType: row.mimeType, data: row.blob.data };
}
