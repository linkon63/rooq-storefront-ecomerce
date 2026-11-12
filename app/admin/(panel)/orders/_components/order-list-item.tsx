"use client";

import type { OrderResponse as Order } from "@/types/commerce/order";
import { formatMoney } from "@/utils/admin/format";
import { formatDateTime } from "@/utils/format-date";
import { orderCustomer, orderPaymentMethod } from "@/utils/orders/display";
import { CodPill, OrderStatusPill, PaymentStatusPill } from "./order-status-pill";

type Props = {
  order: Order;
  isSelected: boolean;
  symbol: string;
  showPaymentStatus: boolean;
  onSelect: () => void;
};

export function OrderListItem({ order, isSelected, symbol, showPaymentStatus, onSelect }: Props) {
  const customer = orderCustomer(order);
  const payment = orderPaymentMethod(order);
  const units = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      aria-pressed={isSelected}
      className={`group flex w-full flex-col gap-2 rounded-md border border-l-4 p-3.5 pl-[11px] text-left transition-colors ${
        isSelected ? "border-slate-300 border-l-slate-800 bg-slate-50 shadow-xs" : "border-slate-100 border-l-transparent bg-white hover:border-slate-200"
      }`}
      onClick={onSelect}
      type="button"
    >
      <span className="flex w-full items-start justify-between gap-2">
        <span className="truncate text-[13px] font-semibold text-slate-800">#{order.orderNumber}</span>
        <span className="shrink-0 text-sm font-semibold text-slate-900 tabular-nums">{formatMoney(order.total, symbol)}</span>
      </span>
      <span className="flex w-full items-center justify-between gap-2 text-[11px] text-slate-600">
        <span className="truncate font-medium">{customer.name}</span>
        {order.orderType === "wholesale" ? (
          <span className="shrink-0 rounded border border-violet-200 bg-violet-50 px-1.5 text-[10px] font-semibold uppercase text-violet-700">
            Wholesale
          </span>
        ) : customer.isGuest ? (
          <span className="shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 text-[10px] font-semibold uppercase text-slate-500">Guest</span>
        ) : null}
      </span>
      <span className="flex w-full items-center justify-between text-[11px] text-slate-500">
        <span>{formatDateTime(order.placedAt)}</span>
        <span>
          {units} {units === 1 ? "unit" : "units"}
        </span>
      </span>
      <span className="mt-1 flex w-full flex-wrap items-center gap-1.5">
        <OrderStatusPill status={order.status} />
        {payment.isCod ? <CodPill /> : null}
        {showPaymentStatus || order.status === "delivered" ? <PaymentStatusPill status={order.paymentStatus} /> : null}
      </span>
    </button>
  );
}
