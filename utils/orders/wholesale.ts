import type { WholesaleRequestStatus } from "@/lib/generated/prisma/enums";

/**
 * Wholesale request transitions enforced by PATCH /wholesale-requests/:id/status.
 * `converted` is reachable only through the convert endpoint.
 */
export const WHOLESALE_TRANSITIONS: Record<WholesaleRequestStatus, readonly WholesaleRequestStatus[]> = {
  pending: ["approved", "rejected", "info_requested"],
  info_requested: ["approved", "rejected", "info_requested"],
  approved: ["rejected"],
  rejected: [],
  converted: [],
};

export function canMoveWholesale(from: WholesaleRequestStatus, to: WholesaleRequestStatus): boolean {
  return WHOLESALE_TRANSITIONS[from].includes(to);
}

/** Customer-facing line for a status change (Notification.message). */
export function wholesaleStatusMessage(status: WholesaleRequestStatus, requestNumber: string, note?: string): string {
  const messages: Partial<Record<WholesaleRequestStatus, string>> = {
    approved: `Your wholesale request ${requestNumber} was approved.`,
    rejected: `Your wholesale request ${requestNumber} was rejected.`,
    info_requested: `More information is needed for your wholesale request ${requestNumber}.`,
  };
  const base = messages[status] ?? `Your wholesale request ${requestNumber} was updated.`;
  return note ? `${base} ${note}` : base;
}

/** Duplicate-line key: product + variant (or the product's default). */
export function wholesaleLineKey(productId: string, variantId: string | null | undefined): string {
  return `${productId}:${variantId ?? "default"}`;
}

export type ConvertLineDraft = { requestItemId: string; label: string; quantity: string; unitPrice: string };
export type ConvertDraft = { addressId: string; items: ConvertLineDraft[]; discount: string; shippingCost: string; tax: string };

const num = (value: string) => Number(value || 0);

/** Live totals of the convert form (strings straight from the inputs). */
export function convertTotals(draft: ConvertDraft) {
  const subtotal = draft.items.reduce((sum, line) => sum + num(line.quantity) * num(line.unitPrice), 0);
  const discount = num(draft.discount);
  const shippingCost = num(draft.shippingCost);
  const tax = num(draft.tax);
  return { subtotal, discount, shippingCost, tax, grandTotal: subtotal - discount + shippingCost + tax };
}

export function canSubmitConvert(draft: ConvertDraft): boolean {
  return (
    Boolean(draft.addressId) &&
    draft.items.length > 0 &&
    draft.items.every((line) => num(line.quantity) >= 1 && line.unitPrice !== "") &&
    convertTotals(draft).grandTotal >= 0
  );
}
