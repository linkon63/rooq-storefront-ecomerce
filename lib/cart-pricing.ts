import type { CartItem } from "@/lib/types";

/**
 * One place that answers "what does this cost, and what did it cost before?".
 *
 * A cart line stores `price` — what the shopper actually pays — and, when an
 * offer applies, the `originalPrice` it was struck down from. Every money
 * figure on the cart, the checkout and the invoice is derived from those two
 * numbers here, so the three screens can never disagree with one another.
 */

/** Unit list price: the offer's "was" price, or just the price when there is none. */
export function unitListPrice(item: Pick<CartItem, "price" | "originalPrice">): number {
  const original = Number(item.originalPrice ?? 0);
  return original > item.price ? original : item.price;
}

/** True when this line carries a real offer worth showing to the shopper. */
export function isDiscounted(item: Pick<CartItem, "price" | "originalPrice">): boolean {
  return unitListPrice(item) > item.price;
}

/** What the offer takes off this line, across its whole quantity. */
export function lineSaving(
  item: Pick<CartItem, "price" | "originalPrice" | "quantity">,
): number {
  return (unitListPrice(item) - item.price) * item.quantity;
}

export type CartTotals = {
  /** Sum of the lines at list price — what the order would cost with no offers. */
  listSubtotal: number;
  /** Sum of the lines at the price actually charged. */
  subtotal: number;
  /** `listSubtotal − subtotal`: the money the offers save the shopper. */
  productDiscount: number;
  /** Total units across the lines. */
  itemCount: number;
};

export function cartTotals(
  items: Pick<CartItem, "price" | "originalPrice" | "quantity">[],
): CartTotals {
  let listSubtotal = 0;
  let subtotal = 0;
  let itemCount = 0;

  for (const item of items) {
    listSubtotal += unitListPrice(item) * item.quantity;
    subtotal += item.price * item.quantity;
    itemCount += item.quantity;
  }

  return {
    listSubtotal,
    subtotal,
    productDiscount: Math.max(0, listSubtotal - subtotal),
    itemCount,
  };
}

/** The saving as a whole-number percentage of the list subtotal — for "Save 15%". */
export function savingPercent(totals: Pick<CartTotals, "listSubtotal" | "productDiscount">): number {
  if (totals.listSubtotal <= 0 || totals.productDiscount <= 0) return 0;
  return Math.round((totals.productDiscount / totals.listSubtotal) * 100);
}
