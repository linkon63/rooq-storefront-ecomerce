import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { mediaRefSelect } from "@/lib/server/media/select";
import { badRequest, notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { toHeroMobileResponse } from "@/utils/mappers/hero-mobile";
import type { HeroMobileInput } from "./schemas";

const mobileSelect = {
  id: true,
  position: true,
  mediaId: true,
  media: { select: mediaRefSelect },
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      media: {
        orderBy: [{ isPrimary: "desc" as const }, { position: "asc" as const }],
        select: { mediaId: true, media: { select: mediaRefSelect } },
      },
    },
  },
} satisfies Prisma.HeroMobileProductSelect;

/** The phone hero's products, in order. */
export async function listHeroMobileProducts() {
  const rows = await prisma.heroMobileProduct.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }], select: mobileSelect });
  return rows.map(toHeroMobileResponse);
}

/** Every product must exist and a chosen photo must be one of that product's own photos. */
async function assertItems(items: HeroMobileInput["items"]) {
  const ids = items.map((item) => item.productId);
  const found = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true, media: { select: { mediaId: true } } } });
  const photos = new Map(found.map((product) => [product.id, new Set(product.media.map((item) => item.mediaId))]));
  for (const item of items) {
    const own = photos.get(item.productId);
    if (!own) throw notFound(ERROR_MESSAGES.heroSlide.productNotFound(item.productId));
    if (item.mediaId && !own.has(item.mediaId)) throw badRequest(ERROR_MESSAGES.heroSlide.mobilePhotoMismatch);
  }
}

/** Replaces the whole list (order = array order). An empty list brings back the newest products. */
export async function setHeroMobileProducts(items: HeroMobileInput["items"]) {
  await assertItems(items);
  await prisma.$transaction([
    prisma.heroMobileProduct.deleteMany({}),
    prisma.heroMobileProduct.createMany({
      data: items.map((item, position) => ({ productId: item.productId, mediaId: item.mediaId, position })),
    }),
  ]);
  return listHeroMobileProducts();
}
