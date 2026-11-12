"use client";

import { useState } from "react";
import type { OrderResponse as Order, PaymentStatus as OrderPaymentStatus, OrderStatus } from "@/types/commerce/order";
import { ConfirmModal } from "../../../_components/confirm-modal";
import { RichDropdown } from "../../../_components/rich-dropdown";
import { humanize, orderCustomer, orderPaymentMethod, paymentStatusTone } from "@/utils/orders/display";
import { OrderInvoiceButton } from "./order-invoice-button";

const PAYMENT_OPTIONS: { value: OrderPaymentStatus; label: string }[] = (
  ["unpaid", "paid", "partially_refunded", "refunded"] as const
).map((value) => ({ value, label: humanize(value) }));

const PRIMARY = "h-11 cursor-pointer rounded-lg px-5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50";

/** The next step for each stage: pending → processing → shipped → delivered. */
const NEXT_STEP: Partial<Record<OrderStatus, OrderStatus>> = { pending: "processing", processing: "shipped", shipped: "delivered" };

type Props = {
  order: Order;
  isUpdating: boolean;
  showPaymentStatus: boolean;
  onStatus: (status: OrderStatus, note?: string) => void;
  onPayment: (status: OrderPaymentStatus) => void;
};

export function OrderActions({ order, isUpdating, showPaymentStatus, onStatus, onPayment }: Props) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmReturn, setConfirmReturn] = useState(false);
  const [cancelNote, setCancelNote] = useState("");
  const customer = orderCustomer(order);
  const isDelivered = order.status === "delivered";
  const awaitingCod = isDelivered && orderPaymentMethod(order).isCod && order.paymentStatus === "unpaid";
  const next = NEXT_STEP[order.status];
  const canCancel = order.status === "pending" || order.status === "processing";

  return (
    <div className="flex flex-wrap items-end gap-3">
      {order.status !== "cancelled" ? <OrderInvoiceButton order={order} /> : null}
      {showPaymentStatus || isDelivered ? (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Payment status</span>
          {isDelivered ? (
            <RichDropdown value={order.paymentStatus} options={PAYMENT_OPTIONS} onChange={onPayment} getTone={paymentStatusTone} />
          ) : (
            <span className={`inline-flex rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize ${paymentStatusTone(order.paymentStatus)}`}>
              {humanize(order.paymentStatus)}
            </span>
          )}
        </div>
      ) : null}
      {awaitingCod ? (
        <button className={`${PRIMARY} bg-emerald-600 hover:bg-emerald-700`} disabled={isUpdating} onClick={() => onPayment("paid")} type="button">
          {isUpdating ? "Saving…" : "Mark COD received"}
        </button>
      ) : null}
      {next ? (
        <button className={`${PRIMARY} bg-blue-600 hover:bg-blue-700`} disabled={isUpdating} onClick={() => onStatus(next)} type="button">
          {isUpdating ? "Processing…" : `Mark ${next}`}
        </button>
      ) : null}
      {canCancel ? (
        <button
          className={`${PRIMARY} bg-red-600 hover:bg-red-700`}
          disabled={isUpdating}
          onClick={() => {
            setCancelNote("");
            setConfirmCancel(true);
          }}
          type="button"
        >
          Cancel
        </button>
      ) : null}
      {isDelivered ? (
        <button className={`${PRIMARY} bg-amber-500 hover:bg-amber-600`} disabled={isUpdating} onClick={() => setConfirmReturn(true)} type="button">
          Return all
        </button>
      ) : null}

      <ConfirmModal
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => {
          setConfirmCancel(false);
          onStatus("cancelled", cancelNote);
        }}
        title={`Cancel order #${order.orderNumber}?`}
        message={`This cancels the order for ${customer.name}, puts the items back in stock and cannot be undone. Say why — it is kept on the order.`}
        confirmText="Yes, cancel the order"
        cancelText="Keep the order"
        confirmDisabled={!cancelNote.trim()}
      >
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Reason *</span>
          <textarea
            autoFocus
            className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-slate-400"
            onChange={(event) => setCancelNote(event.target.value)}
            placeholder="Out of stock, customer asked to cancel, wrong number…"
            rows={3}
            value={cancelNote}
          />
        </label>
      </ConfirmModal>

      <ConfirmModal
        isOpen={confirmReturn}
        onClose={() => setConfirmReturn(false)}
        onConfirm={() => {
          setConfirmReturn(false);
          onStatus("returned");
        }}
        title={`Return all of order #${order.orderNumber}?`}
        message="Every unit not already restocked by a return request goes back into stock and the order moves to Returned. For a partial return or an exchange, use Returns instead."
        confirmText="Yes, return everything"
        cancelText="Keep as delivered"
      />
    </div>
  );
}
