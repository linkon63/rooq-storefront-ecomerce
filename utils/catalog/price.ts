/**
 * Variant pricing rules shared by catalog, cart and checkout. Inputs are plain
 * numbers (convert Prisma Decimals with Number() in the mapper first).
 */

export type PriceSource = { price: number | null; compareAtPrice: number | null };

export const roundMoney = (value: number) => Math.round(value * 100) / 100;

/** Variant override wins; otherwise the product's base price. */
export function effectivePrice(variant: PriceSource, product: { price: number }): number {
  return variant.price ?? product.price;
}

/** Struck-through price, only when it is actually higher than what is charged. */
export function effectiveCompareAt(
  variant: PriceSource,
  product: { price: number; compareAtPrice: number | null },
): number | null {
  const price = effectivePrice(variant, product);
  const compareAt = variant.compareAtPrice ?? product.compareAtPrice;
  return compareAt !== null && compareAt > price ? compareAt : null;
}

export function isOnSale(price: number, compareAtPrice: number | null): boolean {
  return compareAtPrice !== null && compareAtPrice > price;
}

/** 1290 vs 1590 → 19 (whole percent, floored so we never over-promise). */
export function discountPercent(price: number, compareAtPrice: number | null): number {
  if (!isOnSale(price, compareAtPrice) || !compareAtPrice) return 0;
  return Math.floor(((compareAtPrice - price) / compareAtPrice) * 100);
}
