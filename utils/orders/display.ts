import type { OrderResponse, OrderStatus, PaymentStatus } from "@/types/commerce/order";

/** Who an order belongs to, whether it came from an account, a guest checkout or the POS. */
export type OrderCustomer = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  isGuest: boolean;
};

const GUEST_NAME = "Guest customer";
const COD_LABEL = "Cash on Delivery";

export function orderCustomer(order: OrderResponse): OrderCustomer {
  const address = order.shippingAddress ?? order.address;
  const parts = address
    ? [address.addressLine1, address.addressLine2, address.city, address.state, address.postalCode, address.country]
    : [];
  return {
    name: address?.fullName ?? order.user?.name ?? GUEST_NAME,
    email: order.user?.email ?? address?.email ?? null,
    phone: address?.phone || order.user?.phone || null,
    address: parts.filter(Boolean).join(", ") || null,
    isGuest: !order.user,
  };
}

/**
 * How the order is paid. Checkout only offers cash on delivery and a gateway
 * always leaves a Payment row, so an order with no successful payment is cash
 * the courier still has to collect.
 */
export function orderPaymentMethod(order: OrderResponse): { label: string; isCod: boolean } {
  const settled = order.payments.find((payment) => payment.status === "success");
  if (settled && settled.method !== "cash_on_delivery") return { label: settled.method.replace(/_/g, " "), isCod: false };
  return { label: COD_LABEL, isCod: true };
}

/** The note filed the last time the order reached `status` (cancellation / return reason). */
export function orderStatusNote(order: OrderResponse, status: OrderStatus): string | null {
  const note = order.statusLogs.find((entry) => entry.status === status)?.note?.trim();
  return note || null;
}

export type OrderTotals = {
  /** Lines at list price, before offers. */
  subtotal: number;
  productDiscount: number;
  shipping: number;
  /** Coupon / staff discount. */
  discount: number;
  tax: number;
  grand: number;
  paid: number;
  refunded: number;
  due: number;
};

/**
 * The money panel of an order. A COD order is settled by staff marking it
 * paid (no gateway row), so `paid` covers the grand total in that case.
 */
export function orderTotals(order: OrderResponse): OrderTotals {
  const recorded = order.payments.filter((p) => p.status === "success").reduce((sum, p) => sum + p.amount, 0);
  const refunded = order.payments.filter((p) => p.status === "refunded").reduce((sum, p) => sum + p.amount, 0);
  const paid = order.paymentStatus === "unpaid" ? recorded : Math.max(recorded, order.total);
  return {
    subtotal: order.subtotal,
    productDiscount: order.productDiscount,
    shipping: order.shippingCost,
    discount: order.discount,
    tax: order.tax,
    grand: order.total,
    paid,
    refunded,
    due: order.paymentStatus === "refunded" ? 0 : Math.max(0, order.total - paid),
  };
}

/** "Black / M" for a line. */
export function lineOptions(item: { colorName: string | null; sizeLabel: string | null }): string {
  return [item.colorName, item.sizeLabel].filter(Boolean).join(" / ");
}

/** Tailwind classes for an order status pill. */
export function orderStatusTone(status: OrderStatus): string {
  switch (status) {
    case "delivered":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    case "shipped":
    case "processing":
      return "border-slate-200 bg-slate-50 text-slate-700";
    case "cancelled":
    case "returned":
      return "border-rose-300 bg-rose-50 text-rose-700";
    default:
      return "border-amber-300 bg-amber-50 text-amber-700";
  }
}

export function paymentStatusTone(status: PaymentStatus): string {
  if (status === "paid") return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "refunded" || status === "partially_refunded") return "border-amber-300 bg-amber-50 text-amber-700";
  return "border-rose-300 bg-rose-50 text-rose-700";
}

/** "partially_refunded" → "partially refunded" */
export function humanize(value: string): string {
  return value.replace(/_/g, " ").toLowerCase();
}
