import type { ProductCard, ProductDetail } from "@/types/storefront/catalog";
import { toAmount } from "./money";

/**
 * The small product record wishlist, compare and recently-viewed keep in
 * localStorage. Enough to render a card without another request.
 */
export type ProductSnapshot = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  image: string | null;
  price: number;
  compareAtPrice: number | null;
  colors: { name: string; hex: string }[];
  sizes: string[];
  inStock: boolean;
};

export function snapshotFromCard(card: ProductCard): ProductSnapshot {
  return {
    id: card.id,
    slug: card.slug,
    name: card.name,
    brand: card.brand?.name ?? null,
    image: card.image?.url ?? null,
    price: card.price,
    compareAtPrice: card.compareAtPrice,
    colors: card.colors.map(({ name, hex }) => ({ name, hex })),
    sizes: card.sizes.map((size) => size.label),
    inStock: card.inStock,
  };
}

export function snapshotFromDetail(product: ProductDetail, image: string | null): ProductSnapshot {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand?.name ?? null,
    image,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    colors: product.colors.map(({ name, hex }) => ({ name, hex })),
    sizes: product.sizes.map((size) => size.label),
    inStock: product.variants.some((variant) => variant.inStock),
  };
}

type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord => (typeof value === "object" && value !== null ? (value as UnknownRecord) : {});
const text = (value: unknown): string | null => (typeof value === "string" && value ? value : null);

function firstImageUrl(product: UnknownRecord): string | null {
  const image = record(product.image);
  if (text(image.url)) return text(image.url);
  if (text(product.imageUrl)) return text(product.imageUrl);
  const media = Array.isArray(product.media) ? product.media.map(record) : [];
  for (const entry of media) {
    const url = text(entry.url) ?? text(record(entry.media).url);
    if (url) return url;
  }
  return null;
}

/**
 * GET /wishlist rows → snapshots. The row carries `product` in whichever shape
 * the commerce module serialises (a ProductCard, or the legacy include), so
 * read it defensively.
 */
export function snapshotFromWishlistRow(row: unknown): ProductSnapshot | null {
  const entry = record(row);
  const product = record(entry.product ?? entry);
  const id = text(product.id) ?? text(entry.productId);
  const slug = text(product.slug);
  const name = text(product.name);
  if (!id || !slug || !name) return null;
  const colors = Array.isArray(product.colors) ? product.colors.map(record) : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes.map(record) : [];
  return {
    id,
    slug,
    name,
    brand: text(record(product.brand).name),
    image: firstImageUrl(product),
    price: toAmount(product.price),
    compareAtPrice: product.compareAtPrice == null ? null : toAmount(product.compareAtPrice),
    colors: colors.flatMap((color) => (text(color.name) && text(color.hex) ? [{ name: String(color.name), hex: String(color.hex) }] : [])),
    sizes: sizes.flatMap((size) => (text(size.label) ? [String(size.label)] : [])),
    inStock: product.inStock !== false,
  };
}

/** Most recent first, no duplicates, capped. */
export function pushRecent(list: readonly ProductSnapshot[], item: ProductSnapshot, max: number): ProductSnapshot[] {
  return [item, ...list.filter((entry) => entry.id !== item.id)].slice(0, max);
}
