import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { mediaRefSelect } from "@/lib/server/media/select";
import { prisma } from "@/lib/server/prisma";
import type { ProductCard } from "@/utils/mappers/product-card";
import { findProductCards } from "../products/list";

export const collectionSelect = {
  id: true, slug: true, name: true, type: true, description: true, isActive: true, isFeatured: true, position: true,
  startsAt: true, endsAt: true, metaTitle: true, metaDescription: true, coverMediaId: true, createdAt: true, updatedAt: true,
  coverMedia: { select: mediaRefSelect },
  _count: { select: { products: true, looks: true } },
} as const satisfies Prisma.CollectionSelect;

export const lookSelect = {
  id: true, title: true, description: true, position: true, mediaId: true,
  media: { select: mediaRefSelect },
  items: { select: { productId: true, position: true }, orderBy: { position: "asc" } },
} as const satisfies Prisma.CollectionLookSelect;

/** Visible-in-shop window for public reads. */
export function publicCollectionWhere(now: Date): Prisma.CollectionWhereInput {
  return {
    isActive: true,
    AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
  };
}

/** One query for every card the looks reference. */
export async function cardMap(productIds: readonly string[]): Promise<Map<string, ProductCard>> {
  const ids = [...new Set(productIds)];
  if (!ids.length) return new Map();
  const cards = await findProductCards({ id: { in: ids } });
  return new Map(cards.map((card) => [card.id, card]));
}

export function loadLooks(collectionId: string) {
  return prisma.collectionLook.findMany({ where: { collectionId }, select: lookSelect, orderBy: { position: "asc" } });
}
