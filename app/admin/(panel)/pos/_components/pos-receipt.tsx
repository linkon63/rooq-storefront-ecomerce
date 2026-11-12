"use client";

import type { OrderResponse as Order } from "@/types/commerce/order";
import { formatMoney } from "@/utils/admin/format";
import { OrderInvoiceButton } from "../../orders/_components/order-invoice-button";

/** Shown after a completed sale: the number, the total and the printable invoice. */
export function PosReceipt({ order, symbol, onDone }: { order: Order; symbol: string; onDone: () => void }) {
  return (
    <div aria-live="polite" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <div>
        <p className="text-sm font-semibold text-emerald-800">Sale {order.orderNumber} completed</p>
        <p className="text-xs text-emerald-700">
          {formatMoney(order.total, symbol)} · {order.invoiceNumber ?? ""}
        </p>
      </div>
      <div className="flex gap-3">
        <OrderInvoiceButton order={order} />
        <button className="h-11 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white" onClick={onDone} type="button">
          New sale
        </button>
      </div>
    </div>
  );
}
