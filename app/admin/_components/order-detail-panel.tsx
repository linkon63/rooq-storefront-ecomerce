"use client";

import { useState } from "react";

import { RichDropdown } from "./rich-dropdown";
import { AdminIcon, ProductThumb } from "./admin-shell";
import { ConfirmModal } from "./confirm-modal";
import {
  formatMoney,
  orderCustomer,
  orderPaymentMethod,
  resolveImageUrl,
  type Order,
  type OrderPaymentStatus,
  type OrderStatus,
  type OrderTotals,
} from "../../../lib/admin-api";
import { formatDateTime } from "../../../lib/utils";

function statusTone(status: OrderStatus) {
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

function paymentTone(status: string) {
  if (status === "paid") return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "refunded") return "border-amber-300 bg-amber-50 text-amber-700";
  return "border-rose-300 bg-rose-50 text-rose-700";
}

function statusIcon(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "calendar";
    case "processing":
      return "refresh";
    case "shipped":
      return "package";
    case "delivered":
      return "check";
    case "cancelled":
    case "returned":
      return "x";
    default:
      return "orders";
  }
}

const PAYMENT_STATUS_OPTIONS: { value: OrderPaymentStatus; label: string }[] = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

interface OrderDetailPanelProps {
  order: Order;
  totals: OrderTotals | null;
  symbol: string;
  onUpdateOrderStatus: (status: OrderStatus) => void;
  onUpdatePaymentStatus: (paymentStatus: OrderPaymentStatus) => void;
  isUpdatingStatus?: boolean;
  /** Off on New Orders — payment is settled once the order is delivered. */
  showPaymentStatus?: boolean;
}

export function OrderDetailPanel({
  order,
  totals,
  symbol,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  isUpdatingStatus = false,
  showPaymentStatus = true,
}: OrderDetailPanelProps) {
  // Marking an order returned puts it in the refund queue and cannot be undone
  // from this screen, so it asks first.
  const [confirmReturn, setConfirmReturn] = useState(false);
  const customer = orderCustomer(order);
  const payment = orderPaymentMethod(order);

  // Payment is settled once the parcel is delivered — that is when the courier
  // hands over the cash — so the payment controls appear then even on the New
  // Orders screen, which otherwise keeps them out of the way.
  const isDelivered = order.status === "delivered";
  const canSettlePayment = showPaymentStatus || isDelivered;

  // What the order took off the catalogue price, from both kinds of discount.
  const totalSaving = (totals?.productDiscount ?? 0) + (totals?.discount ?? 0);
  const savedPercent =
    totals && totals.subtotal > 0 && totalSaving > 0
      ? Math.round((totalSaving / totals.subtotal) * 100)
      : 0;
  const awaitingCod = isDelivered && payment.isCod && order.paymentStatus === "unpaid";

  return (
    <>
      <div className="mb-4 flex flex-col justify-between gap-4 rounded-lg bg-white p-4 sm:flex-row sm:items-center shadow-xs border border-slate-200/60">
        <div className="flex items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-full border shadow-sm ring-4 ring-offset-0 ${
            order.status === "delivered"
              ? "border-emerald-200 bg-emerald-50 text-emerald-600 ring-emerald-50"
              : order.status === "cancelled" || order.status === "returned"
                ? "border-rose-200 bg-rose-50 text-rose-600 ring-rose-50"
                : order.status === "pending"
                  ? "border-amber-200 bg-amber-50 text-amber-600 ring-amber-50"
                  : "border-slate-200 bg-slate-50/80 text-slate-600 ring-slate-100"
          }`}>
            <AdminIcon className="h-5 w-5" name={statusIcon(order.status)} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              Order #{order.orderNumber}
              <span
                className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  payment.isCod
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
                title={payment.isCod ? "Cash collected by the courier on delivery" : undefined}
              >
                {payment.isCod ? "COD" : payment.label}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {formatDateTime(order.placedAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          {canSettlePayment && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Payment Status</span>
              {isDelivered ? (
                <RichDropdown
                  value={order.paymentStatus}
                  options={PAYMENT_STATUS_OPTIONS}
                  onChange={onUpdatePaymentStatus}
                  getTone={paymentTone}
                />
              ) : (
                <span className={`inline-flex items-center rounded-lg border px-2 py-1.5 text-xs font-semibold capitalize ${paymentTone(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              )}
            </div>
          )}
          {awaitingCod && (
            <button
              type="button"
              disabled={isUpdatingStatus}
              onClick={() => onUpdatePaymentStatus("paid")}
              className="h-11 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUpdatingStatus ? "Saving..." : "Mark COD Received"}
            </button>
          )}
          {(order.status === "pending" || order.status === "processing") && (
            <div className="flex items-end gap-2">
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => onUpdateOrderStatus(order.status === "pending" ? "processing" : "shipped")}
                className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUpdatingStatus ? "Processing..." : "Accept"}
              </button>
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => onUpdateOrderStatus("cancelled")}
                className="h-11 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
          {order.status === "shipped" && (
            <div className="flex items-end">
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => onUpdateOrderStatus("delivered")}
                className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUpdatingStatus ? "Processing..." : "Accept"}
              </button>
            </div>
          )}
          {order.status === "delivered" && (
            <div className="flex items-end">
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => setConfirmReturn(true)}
                className="h-10 rounded-lg bg-amber-500 px-5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUpdatingStatus ? "Processing..." : "Return"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <div className="rounded-lg border border-slate-200/60 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
            Customer Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 font-semibold text-slate-700 text-sm">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate flex items-center gap-2">
                  {customer.name}
                  {customer.isGuest && (
                    <span className="shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Guest
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {customer.email ?? "No email provided"}
                </p>
              </div>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-medium text-slate-400">Phone:</span>
                <span className="font-semibold">{customer.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/60 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
            Shipping Address
          </h3>
          <div className="space-y-1 text-xs text-slate-700 font-medium">
            <p className="font-bold text-slate-900 text-sm">{customer.name}</p>
            {customer.phone && <p className="text-slate-600 font-semibold">Phone: {customer.phone}</p>}
            <p className="leading-relaxed text-slate-600 pt-0.5">{customer.address || "No address details available"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200/60 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 p-5 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
            Order Items
          </h3>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
            {order.items?.length ?? 0} {order.items?.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="p-5">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {(order.items ?? []).map((item, index) => {
                const mediaUrl = item.product?.media?.find((m) => m.isFeatured)?.media?.url 
                  || item.product?.media?.[0]?.media?.url 
                  || null;
                const resolvedUrl = mediaUrl ? resolveImageUrl(mediaUrl) : null;

                // The offer is read off the order, not the catalogue, so this
                // is what the customer was charged even if the discount has
                // since changed or ended. Orders placed before offers were
                // recorded carry no listPrice and simply show one price.
                const unitPrice = Number(item.unitPrice ?? 0);
                const listPrice = Number(item.listPrice ?? unitPrice);
                const lineSaving = Number(item.discountAmount ?? 0);
                const wasDiscounted = listPrice > unitPrice;

                return (
                  <div className="flex gap-4 items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0" key={item.id}>
                    {resolvedUrl ? (
                      <img
                        alt={item.product?.name ?? "Product"}
                        className="h-12 w-16 rounded-md border border-slate-150 object-cover bg-white shrink-0"
                        src={resolvedUrl}
                      />
                    ) : (
                      <ProductThumb color={["bg-slate-500/80", "bg-slate-600/80", "bg-slate-400/80"][index % 3]} />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-slate-800 uppercase truncate">
                        {item.product?.name ?? "Product"}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded">
                          SKU: {item.variant?.sku ?? "\u2014"}
                        </span>
                        {item.variant?.sku && (
                          <span className="text-[10px] text-slate-300">|</span>
                        )}
                        <span className="text-[11px] font-medium text-slate-500">
                          {item.quantity} &#x2715;{" "}
                          {wasDiscounted && (
                            <span className="text-slate-400 line-through">
                              {formatMoney(listPrice, symbol)}
                            </span>
                          )}{" "}
                          <span className={wasDiscounted ? "font-semibold text-slate-700" : undefined}>
                            {formatMoney(unitPrice, symbol)}
                          </span>
                        </span>
                        {wasDiscounted && (
                          <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            Offer
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {wasDiscounted && (
                        <p className="text-[11px] text-slate-400 line-through">
                          {formatMoney(listPrice * item.quantity, symbol)}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-slate-800">
                        {formatMoney(item.totalPrice, symbol)}
                      </p>
                      {lineSaving > 0 && (
                        <p className="text-[10px] font-semibold text-emerald-600">
                          saved {formatMoney(lineSaving, symbol)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {(order.items ?? []).length === 0 && (
                <p className="text-xs font-semibold text-slate-400 text-center py-6">No items in this order.</p>
              )}
            </div>

            {totals && (
              <div className="rounded-lg border border-slate-200/60 bg-slate-50/80 p-4 shrink-0 h-fit">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Payment Summary
                </h4>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Subtotal</span>
                    <span className="font-semibold text-slate-800">{formatMoney(totals.subtotal, symbol)}</span>
                  </div>

                  {totals.productDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Product Discount</span>
                      <span className="font-semibold text-emerald-600">- {formatMoney(totals.productDiscount, symbol)}</span>
                    </div>
                  )}

                  {totals.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Coupon Discount</span>
                      <span className="font-semibold text-rose-600">- {formatMoney(totals.discount, symbol)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Delivery Charge</span>
                    <span className="font-semibold text-slate-800">{formatMoney(totals.shipping, symbol)}</span>
                  </div>

                  <div className="border-t border-slate-200/60 pt-2.5 flex justify-between items-center">
                    <span className="font-semibold text-slate-800 text-[13px]">Total</span>
                    <span className="font-semibold text-slate-900 text-[15px]">{formatMoney(totals.grand, symbol)}</span>
                  </div>

                  {totalSaving > 0 && (
                    <div className="flex justify-between items-center rounded-md border border-emerald-100/50 bg-emerald-50/50 px-2 py-1.5 text-emerald-700">
                      <span className="font-semibold text-[11px]">Customer Saved</span>
                      <span className="font-semibold text-xs">
                        {formatMoney(totalSaving, symbol)}
                        {savedPercent > 0 && ` (${savedPercent}%)`}
                      </span>
                    </div>
                  )}

                  {canSettlePayment && (
                    <>
                      <div className="flex justify-between items-center text-emerald-600 bg-emerald-50/50 px-2 py-1.5 rounded-md border border-emerald-100/50 mt-1">
                        <span className="font-semibold text-[11px]">Paid Amount</span>
                        <span className="font-semibold text-xs">{formatMoney(totals.paid, symbol)}</span>
                      </div>

                      <div className="flex justify-between items-center text-rose-600 bg-rose-50/50 px-2 py-1.5 rounded-md border border-rose-100/50 mt-1">
                        <span className="font-semibold text-[11px]">Due Amount</span>
                        <span className="font-semibold text-xs">{formatMoney(totals.due, symbol)}</span>
                      </div>
                    </>
                  )}

                  {awaitingCod && (
                    <p className="mt-1 rounded-md border border-amber-100 bg-amber-50/60 px-2 py-1.5 text-[11px] font-semibold text-amber-700">
                      Collect {formatMoney(totals.grand, symbol)} from the courier, then mark the
                      payment received.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmReturn}
        onClose={() => setConfirmReturn(false)}
        onConfirm={() => {
          setConfirmReturn(false);
          onUpdateOrderStatus("returned");
        }}
        title={`Return order #${order.orderNumber}?`}
        message={`This marks the order as returned and moves it to Returned Orders for ${customer.name}. Restock the items and settle the refund separately.`}
        confirmText="Yes, mark as returned"
        cancelText="Keep as delivered"
      />
    </>
  );
}
