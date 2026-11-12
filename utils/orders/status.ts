import type { OrderStatus, PaymentStatus } from "@/lib/generated/prisma/enums";

/**
 * Order status rules. Cancelled and returned are terminal: their stock has
 * already been put back, so re-opening them would double-count inventory.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["processing", "shipped", "delivered", "cancelled"],
  processing: ["pending", "shipped", "delivered", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

/** Same status is allowed (it only files another note in the history). */
export function canMoveOrder(from: OrderStatus, to: OrderStatus): boolean {
  return from === to || ORDER_TRANSITIONS[from].includes(to);
}

/** A customer may cancel until the parcel leaves the shop. */
export function isCustomerCancellable(status: OrderStatus): boolean {
  return status === "pending" || status === "processing";
}

/** Statuses whose stock has left inventory for good (or is in transit). */
export function holdsStock(status: OrderStatus): boolean {
  return status !== "cancelled" && status !== "returned";
}

/** Payment status after `refunded` in total has gone back against an order of `total`. */
export function paymentStatusAfterRefund(refunded: number, total: number): PaymentStatus {
  return refunded + 0.005 >= total ? "refunded" : "partially_refunded";
}
