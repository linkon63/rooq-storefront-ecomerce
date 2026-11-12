import type { CollectionType } from "@/lib/generated/prisma/enums";
import { mediaSrc } from "@/utils/media-url";
import type { MediaRow } from "./catalog-refs";
import type { ProductCard } from "./product-card";

export type CollectionRow = {
  id: string; slug: string; name: string; type: CollectionType; description: string | null;
  isActive: boolean; isFeatured: boolean; position: number; startsAt: Date | null; endsAt: Date | null;
  metaTitle: string | null; metaDescription: string | null; coverMediaId: string | null; coverMedia: MediaRow | null;
  createdAt: Date; updatedAt: Date; _count: { products: number; looks: number };
};

export type LookRow = {
  id: string; title: string | null; description: string | null; position: number; mediaId: string | null; media: MediaRow | null;
  items: { productId: string; position: number }[];
};

export function toCollectionSummary(row: CollectionRow) {
  return {
    id: row.id, slug: row.slug, name: row.name, type: row.type, description: row.description,
    coverImageUrl: mediaSrc(row.coverMedia), coverMediaId: row.coverMediaId,
    isActive: row.isActive, isFeatured: row.isFeatured, position: row.position, startsAt: row.startsAt, endsAt: row.endsAt,
    productCount: row._count.products, lookCount: row._count.looks, createdAt: row.createdAt, updatedAt: row.updatedAt,
  };
}

/** Cards in the given id order; ids without a visible card are dropped. */
export function cardsInOrder(ids: readonly string[], cards: ReadonlyMap<string, ProductCard>): ProductCard[] {
  return ids.flatMap((id) => cards.get(id) ?? []);
}

export function toLook(row: LookRow, cards: ReadonlyMap<string, ProductCard>) {
  const productIds = [...row.items].sort((a, b) => a.position - b.position).map((item) => item.productId);
  return {
    id: row.id, title: row.title, description: row.description, position: row.position,
    imageUrl: mediaSrc(row.media), mediaId: row.mediaId, productIds, products: cardsInOrder(productIds, cards),
  };
}

export type CollectionSummary = ReturnType<typeof toCollectionSummary>;
export type Look = ReturnType<typeof toLook>;
