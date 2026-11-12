import type { Order } from "@/types/storefront/commerce";

/** The order just placed, kept for the confirmation page (this tab only). */
const KEY = "rooq.lastOrder.v1";

export function rememberLastOrder(order: Order): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    // The confirmation page falls back to the order number in the URL.
  }
}

export function readLastOrder(orderNumber: string | null): Order | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const order = JSON.parse(raw) as Order;
    return !orderNumber || order.orderNumber === orderNumber ? order : null;
  } catch {
    return null;
  }
}
