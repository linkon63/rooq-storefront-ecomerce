import { roundMoney } from "./price";

export type DiscountRule = { id: string; type: "percentage" | "fixed"; value: number };

/** Amount a discount takes off one unit, never more than the price itself. */
export function discountAmount(price: number, rule: Pick<DiscountRule, "type" | "value">): number {
  const raw = rule.type === "percentage" ? price * (rule.value / 100) : rule.value;
  return roundMoney(Math.min(Math.max(raw, 0), price));
}

/** Unit price after a product discount. */
export function applyDiscount(price: number, rule: Pick<DiscountRule, "type" | "value"> | null): number {
  if (!rule) return price;
  return roundMoney(price - discountAmount(price, rule));
}

/** The discount that takes the most off `price` (the old pickBestDiscount). */
export function bestDiscount<T extends Pick<DiscountRule, "type" | "value">>(price: number, rules: T[]): T | null {
  let best: T | null = null;
  let bestAmount = -1;
  for (const rule of rules) {
    const amount = discountAmount(price, rule);
    if (amount > bestAmount) {
      best = rule;
      bestAmount = amount;
    }
  }
  return best;
}

/**
 * Selling price + struck-through price once an active discount is applied:
 * the discount lowers the price; the compare-at shows the higher of the
 * stored compare-at and the undiscounted price.
 */
export function salePricing(
  price: number,
  compareAtPrice: number | null,
  rule: Pick<DiscountRule, "type" | "value"> | null,
): { price: number; compareAtPrice: number | null } {
  const selling = applyDiscount(price, rule);
  const reference = Math.max(compareAtPrice ?? 0, rule && selling < price ? price : 0);
  return { price: selling, compareAtPrice: reference > selling ? reference : null };
}
