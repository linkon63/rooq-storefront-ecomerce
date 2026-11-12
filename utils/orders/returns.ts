import type { ReturnResolution, ReturnStatus } from "@/lib/generated/prisma/enums";
import { roundMoney } from "@/utils/catalog/price";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Return requests that still claim their units (everything except rejected / cancelled). */
export const ACTIVE_RETURN_STATUSES: readonly ReturnStatus[] = ["REQUESTED", "APPROVED", "REFUNDED", "EXCHANGED"];

/** Returns the shop has accepted (units are back with the shop). */
export const ACCEPTED_RETURN_STATUSES: readonly ReturnStatus[] = ["APPROVED", "REFUNDED", "EXCHANGED"];

export function isActiveReturn(status: ReturnStatus): boolean {
  return ACTIVE_RETURN_STATUSES.includes(status);
}

/**
 * Allowed admin transitions:
 *   REQUESTED → APPROVED | REJECTED | CANCELLED
 *   APPROVED  → REFUNDED (REFUND resolution) | EXCHANGED (EXCHANGE resolution)
 */
export function canMoveReturn(from: ReturnStatus, to: ReturnStatus, resolution: ReturnResolution): boolean {
  if (from === "REQUESTED") return to === "APPROVED" || to === "REJECTED" || to === "CANCELLED";
  if (from === "APPROVED") {
    return (to === "REFUNDED" && resolution === "REFUND") || (to === "EXCHANGED" && resolution === "EXCHANGE");
  }
  return false;
}

/** The statuses an admin can move a return to next (drives the action buttons). */
export function nextReturnStatuses(from: ReturnStatus, resolution: ReturnResolution): ReturnStatus[] {
  const all: ReturnStatus[] = ["APPROVED", "REJECTED", "CANCELLED", "REFUNDED", "EXCHANGED"];
  return all.filter((to) => canMoveReturn(from, to, resolution));
}

/** Last moment a return may be opened, or null when the delivery date is unknown. */
export function returnDeadline(deliveredAt: Date | null, windowDays: number): Date | null {
  if (!deliveredAt) return null;
  return new Date(deliveredAt.getTime() + windowDays * DAY_MS);
}

/** Units of a line still free to return. */
export function returnableQuantity(ordered: number, alreadyClaimed: number): number {
  return Math.max(0, ordered - alreadyClaimed);
}

/** Default refund: Σ unitPrice × returned quantity. */
export function defaultRefundAmount(items: readonly { unitPrice: number; quantity: number }[]): number {
  return roundMoney(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0));
}

/** True when every unit of every line has gone back (order becomes `returned`). */
export function isFullyReturned(lines: readonly { quantity: number; returned: number }[]): boolean {
  return lines.length > 0 && lines.every((line) => line.returned >= line.quantity);
}

/** Units of an order line already claimed by returns that are still active. */
export function claimedQuantity(claims: readonly { quantity: number; returnRequest: { status: ReturnStatus } }[]): number {
  return claims.reduce((sum, claim) => (isActiveReturn(claim.returnRequest.status) ? sum + claim.quantity : sum), 0);
}

/** When the order was delivered: the courier's delivery time, else the `delivered` status log. */
export function deliveryDate(
  shipments: readonly { deliveredAt: Date | null }[],
  deliveredLogs: readonly { createdAt: Date }[],
): Date | null {
  return shipments.find((shipment) => shipment.deliveredAt)?.deliveredAt ?? deliveredLogs[0]?.createdAt ?? null;
}
