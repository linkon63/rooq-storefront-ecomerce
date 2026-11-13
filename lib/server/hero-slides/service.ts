import "server-only";
import type { HeroMode } from "@/lib/generated/prisma/enums";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { mediaRefSelect } from "@/lib/server/media/select";
import { releaseMedia } from "@/lib/server/media/release";
import { badRequest, notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { toHeroSlideResponse } from "@/utils/mappers/hero-slide";
import type { HeroSlideUpdateInput } from "./schemas";

const slideSelect = {
  id: true,
  position: true,
  isActive: true,
  productId: true,
  media: { select: mediaRefSelect },
  product: { select: { id: true, name: true, slug: true, status: true } },
} as const;

async function assertProduct(productId: string | null | undefined) {
  if (!productId) return;
  const found = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!found) throw notFound(ERROR_MESSAGES.heroSlide.productNotFound(productId));
}

/** Every slide in order (admin), or only the active ones (storefront). */
export async function listHeroSlides({ activeOnly = false } = {}) {
  const rows = await prisma.heroSlide.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: slideSelect,
  });
  return rows.map(toHeroSlideResponse);
}

/** Adds one slide per uploaded image, at the end. A product link applies to a single upload only. */
export async function createHeroSlides(mediaIds: readonly string[], productId: string | null | undefined) {
  if (mediaIds.length === 0) throw badRequest(ERROR_MESSAGES.heroSlide.imageRequired);
  await assertProduct(productId);
  const last = await prisma.heroSlide.aggregate({ _max: { position: true } });
  const start = (last._max.position ?? -1) + 1;
  const linked = mediaIds.length === 1 ? (productId ?? null) : null;
  const rows = await prisma.$transaction(
    mediaIds.map((mediaId, index) =>
      prisma.heroSlide.create({ data: { mediaId, productId: linked, position: start + index }, select: slideSelect }),
    ),
  );
  return rows.map(toHeroSlideResponse);
}

export async function updateHeroSlide(id: string, input: HeroSlideUpdateInput) {
  await assertProduct(input.productId);
  const exists = await prisma.heroSlide.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw notFound(ERROR_MESSAGES.heroSlide.notFound(id));
  const row = await prisma.heroSlide.update({
    where: { id },
    data: { ...(input.productId !== undefined ? { productId: input.productId } : {}), ...(input.isActive !== undefined ? { isActive: input.isActive } : {}) },
    select: slideSelect,
  });
  return toHeroSlideResponse(row);
}

export async function deleteHeroSlide(id: string) {
  const row = await prisma.heroSlide.findUnique({ where: { id }, select: { mediaId: true } });
  if (!row) throw notFound(ERROR_MESSAGES.heroSlide.notFound(id));
  await prisma.heroSlide.delete({ where: { id } });
  await releaseMedia(row.mediaId);
  return { message: SUCCESS_MESSAGES.heroSlide.deleted };
}

/** Saves a new order; the list must hold every slide exactly once. */
export async function reorderHeroSlides(ids: readonly string[]) {
  const current = await prisma.heroSlide.findMany({ select: { id: true } });
  const known = new Set(current.map((row) => row.id));
  if (ids.length !== known.size || new Set(ids).size !== ids.length || ids.some((id) => !known.has(id))) {
    throw badRequest(ERROR_MESSAGES.heroSlide.reorderMismatch);
  }
  await prisma.$transaction(ids.map((id, position) => prisma.heroSlide.update({ where: { id }, data: { position } })));
  return listHeroSlides();
}

export async function getHeroMode(): Promise<HeroMode> {
  const row = await prisma.setting.findFirst({ select: { heroMode: true } });
  return row?.heroMode ?? "SLIDER";
}

export async function setHeroMode(mode: HeroMode): Promise<{ mode: HeroMode }> {
  const row = await prisma.setting.findFirst({ select: { id: true } });
  if (row) await prisma.setting.update({ where: { id: row.id }, data: { heroMode: mode } });
  else await prisma.setting.create({ data: { heroMode: mode } });
  return { mode };
}
