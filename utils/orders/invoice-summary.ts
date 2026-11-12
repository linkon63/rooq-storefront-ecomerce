import type { OrderResult } from "@/types/storefront/ui";
import { cartTotals } from "@/utils/cart-pricing";

/** Delivery zone → what the customer sees it called. */
export const INVOICE_ZONE_LABELS: Record<string, string> = {
  inside: "Inside Dhaka",
  near_city: "Near Dhaka",
  outside: "Outside Dhaka",
};

export function formatInvoiceDate(value?: string): string {
  const date = value ? new Date(value) : new Date();
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  return safe.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Each address part once, in order. Guest checkout stores the delivery zone in
 * both city and state; the zone is already on the Delivery row, so it is left
 * out of the address too.
 */
export function addressParts(parts: (string | undefined)[], omit?: string): string[] {
  const seen = new Set(omit ? [omit.trim().toLowerCase()] : []);
  return parts.flatMap((part) => {
    const value = part?.trim();
    if (!value || seen.has(value.toLowerCase())) return [];
    seen.add(value.toLowerCase());
    return [value];
  });
}

export type InvoiceSummary = {
  subtotal: number;
  productDiscount: number;
  couponDiscount: number;
  totalDiscount: number;
  deliveryCharge: number;
  payable: number;
  savedPercent: number;
  isCod: boolean;
  zoneLabel?: string;
  cityLine: string;
  details: [string, string][];
};

/**
 * Totals and header facts for an invoice. Older stored orders carry no
 * subtotal / productDiscount / shippingCost, so those are recomputed from the
 * lines with the same arithmetic that produced them.
 */
export function summariseInvoice(order: OrderResult): InvoiceSummary {
  const lines = cartTotals((order.items ?? []).map((item) => ({ price: item.price, originalPrice: item.originalPrice, quantity: item.quantity })));
  const subtotal = order.subtotal ?? lines.listSubtotal;
  const productDiscount = Math.max(0, order.productDiscount ?? lines.productDiscount);
  const couponDiscount = Math.max(0, order.discount ?? 0);
  const totalDiscount = productDiscount + couponDiscount;
  const deliveryCharge = order.shippingCost ?? (!totalDiscount && order.total > subtotal ? order.total - subtotal : 0);
  const payable = order.total ?? subtotal - totalDiscount + deliveryCharge;
  const isCod = (order.paymentMethod ?? "cod") === "cod";
  const zoneLabel = order.deliveryZone ? (INVOICE_ZONE_LABELS[order.deliveryZone] ?? order.deliveryZone) : undefined;
  const details: [string, string][] = [
    ...(order.invoiceNumber ? [["Invoice No.", order.invoiceNumber] as [string, string]] : []),
    ["Order ID", order.orderNumber],
    ["Date", formatInvoiceDate(order.placedAt)],
    ["Payment", isCod ? "Cash on Delivery" : "Paid online"],
    ...(zoneLabel ? [["Delivery", zoneLabel] as [string, string]] : []),
  ];
  return {
    subtotal,
    productDiscount,
    couponDiscount,
    totalDiscount,
    deliveryCharge,
    payable,
    savedPercent: subtotal > 0 && totalDiscount > 0 ? Math.round((totalDiscount / subtotal) * 100) : 0,
    isCod,
    zoneLabel,
    cityLine: addressParts([order.address.city, order.address.state], zoneLabel).join(", "),
    details,
  };
}
