"use client";

import type { OrderResponse as Order, PaymentStatus as OrderPaymentStatus, OrderStatus } from "@/types/commerce/order";
import { formatDateTime } from "@/utils/format-date";
import { orderPaymentMethod, orderStatusNote, orderTotals } from "@/utils/orders/display";
import { OrderActions } from "./order-actions";
import { OrderCustomerCards } from "./order-customer-cards";
import { OrderHistoryCard } from "./order-history-card";
import { OrderItemRow } from "./order-item-row";
import { OrderPaymentSummary } from "./order-payment-summary";
import { OrderShipmentsCard } from "./order-shipments-card";
import { OrderStatusPill } from "./order-status-pill";

type Props = {
  order: Order;
  symbol: string;
  isUpdating: boolean;
  /** Off on New Orders — payment is settled once the order is delivered. */
  showPaymentStatus: boolean;
  onStatus: (status: OrderStatus, note?: string) => void;
  onPayment: (status: OrderPaymentStatus) => void;
  onChanged: (order: Order) => void;
};

export function OrderDetailPanel({ order, symbol, isUpdating, showPaymentStatus, onStatus, onPayment, onChanged }: Props) {
  const totals = orderTotals(order);
  const payment = orderPaymentMethod(order);
  const isDelivered = order.status === "delivered";
  const cancelReason = order.status === "cancelled" ? orderStatusNote(order, "cancelled") : null;

  return (
    <>
      <header className="mb-4 flex flex-col justify-between gap-4 rounded-lg border border-slate-200/60 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div>
          <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
            Order #{order.orderNumber}
            <OrderStatusPill status={order.status} />
            <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
              {payment.isCod ? "COD" : payment.label}
            </span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Placed {formatDateTime(order.placedAt)}
            {order.invoiceNumber ? ` · ${order.invoiceNumber}` : ""}
          </p>
        </div>
        <OrderActions isUpdating={isUpdating} onPayment={onPayment} onStatus={onStatus} order={order} showPaymentStatus={showPaymentStatus} />
      </header>

      {cancelReason ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50/70 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-500">Cancellation reason</p>
          <p className="mt-1 whitespace-pre-line text-sm font-medium text-rose-800">{cancelReason}</p>
        </div>
      ) : null}

      <OrderCustomerCards order={order} />

      <section className="overflow-hidden rounded-lg border border-slate-200/60 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Items</h3>
          <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {order.items.length} {order.items.length === 1 ? "line" : "lines"}
          </span>
        </div>
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-4">
            {order.items.map((item) => (
              <OrderItemRow item={item} key={item.id} symbol={symbol} />
            ))}
          </ul>
          <OrderPaymentSummary
            awaitingCod={isDelivered && payment.isCod && order.paymentStatus === "unpaid"}
            couponCode={order.couponCode}
            showSettlement={showPaymentStatus || isDelivered}
            symbol={symbol}
            totals={totals}
          />
        </div>
      </section>

      <OrderShipmentsCard onChanged={onChanged} order={order} />
      <OrderHistoryCard order={order} />
    </>
  );
}
