import { roundMoney } from "@/utils/catalog/price";
import { applyDiscount, type DiscountRule } from "@/utils/catalog/discount";
import type { CouponType, DeliveryZone } from "@/lib/generated/prisma/enums";

/**
 * Order arithmetic — the single place that decides what a basket costs.
 * Inputs are plain numbers; Prisma Decimals are converted before they get here.
 */

export type PricedLine = {
  quantity: number;
  /** Catalogue price per unit before any offer. */
  listPrice: number;
  /** Charged per unit (offer applied). */
  unitPrice: number;
  /** (listPrice − unitPrice) × quantity */
  discountAmount: number;
  /** unitPrice × quantity */
  totalPrice: number;
};

/** Prices one line with the product's best offer (same rule the catalogue quotes). */
export function priceLine(listPrice: number, rule: Pick<DiscountRule, "type" | "value"> | null, quantity: number): PricedLine {
  const unitPrice = applyDiscount(listPrice, rule);
  return {
    quantity,
    listPrice: roundMoney(listPrice),
    unitPrice,
    discountAmount: roundMoney((listPrice - unitPrice) * quantity),
    totalPrice: roundMoney(unitPrice * quantity),
  };
}

/** A negotiated price (wholesale, POS override): no catalogue offer applies. */
export function fixedPriceLine(unitPrice: number, quantity: number): PricedLine {
  const price = roundMoney(unitPrice);
  return { quantity, listPrice: price, unitPrice: price, discountAmount: 0, totalPrice: roundMoney(price * quantity) };
}

export type LineTotals = {
  /** Σ listPrice × qty */
  subtotal: number;
  /** Σ discountAmount */
  productDiscount: number;
  /** subtotal − productDiscount: the base a coupon applies to. */
  payable: number;
};

export function sumLines(lines: readonly PricedLine[]): LineTotals {
  let subtotal = 0;
  let productDiscount = 0;
  for (const line of lines) {
    subtotal += line.listPrice * line.quantity;
    productDiscount += line.discountAmount;
  }
  subtotal = roundMoney(subtotal);
  productDiscount = roundMoney(productDiscount);
  return { subtotal, productDiscount, payable: roundMoney(subtotal - productDiscount) };
}

export type CouponRule = { type: CouponType; value: number };

/**
 * What a coupon takes off `base` (the subtotal after product offers), never
 * more than the base itself — the two discounts stack rather than overlap.
 */
export function couponDiscount(rule: CouponRule, base: number): number {
  const raw = rule.type === "percentage" ? base * (rule.value / 100) : rule.value;
  return roundMoney(Math.min(Math.max(raw, 0), Math.max(base, 0)));
}

export type CouponState = {
  isActive: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
  maxUsage: number | null;
  usedCount: number;
  minOrderAmount: number | null;
};

export type CouponProblem = "inactive" | "notStarted" | "expired" | "usageLimit" | "minOrder";

/** Why a coupon cannot be used right now, or null when it can. */
export function couponProblem(coupon: CouponState, base: number, now: Date): CouponProblem | null {
  if (!coupon.isActive) return "inactive";
  if (coupon.startsAt && coupon.startsAt > now) return "notStarted";
  if (coupon.expiresAt && coupon.expiresAt < now) return "expired";
  if (coupon.maxUsage !== null && coupon.usedCount >= coupon.maxUsage) return "usageLimit";
  if (coupon.minOrderAmount !== null && base < coupon.minOrderAmount) return "minOrder";
  return null;
}

export type DeliveryRates = Record<DeliveryZone, number>;

/**
 * Delivery charge for a zone, from Settings. Free once the payable amount
 * reaches the free-shipping threshold (when one is set).
 */
export function shippingCharge(zone: DeliveryZone, rates: DeliveryRates, freeThreshold: number | null, payable: number): number {
  if (freeThreshold !== null && freeThreshold > 0 && payable >= freeThreshold) return 0;
  const rate = rates[zone];
  return Number.isFinite(rate) && rate > 0 ? roundMoney(rate) : 0;
}

export function orderTotal(parts: { payable: number; discount: number; shippingCost: number; tax: number }): number {
  return roundMoney(parts.payable - parts.discount + parts.shippingCost + parts.tax);
}
