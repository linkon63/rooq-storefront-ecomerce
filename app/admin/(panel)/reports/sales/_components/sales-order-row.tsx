"use client";

import type { SalesReportOrder } from "@/types/admin/reports";
import { formatMoney } from "@/utils/admin/format";
import { formatDate } from "@/utils/format-date";
import { useCurrency } from "@/hooks/use-currency";
import { AdminIcon } from "../../../../_components/admin-shell";
import { SalesOrderItems } from "./sales-order-items";

export function SalesOrderRow({
  order,
  isOpen,
  onToggle,
}: {
  order: SalesReportOrder;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { symbol } = useCurrency();
  const discount = order.discount + (order.productDiscount ?? 0);
  return (
    <>
      <tr className="border-b border-slate-50 font-black transition hover:bg-slate-50/50">
        <td className="px-6 py-4">{order.orderNumber}</td>
        <td className="px-6 py-4 text-slate-600">{order.customer}</td>
        <td className="px-6 py-4 tabular-nums">{formatMoney(order.total, symbol)}</td>
        <td className="px-6 py-4 tabular-nums">{formatMoney(discount, symbol)}</td>
        <td className="px-6 py-4 text-slate-500">{formatDate(order.placedAt)}</td>
        <td className="px-6 py-4">
          <button
            aria-expanded={isOpen}
            aria-label={isOpen ? `Hide items of ${order.orderNumber}` : `Show items of ${order.orderNumber}`}
            className="grid h-8 w-8 place-items-center rounded-md hover:bg-slate-100"
            onClick={onToggle}
            type="button"
          >
            <AdminIcon className={`h-4 w-4 text-slate-400 transition ${isOpen ? "rotate-90" : ""}`} name="chevronRight" />
          </button>
        </td>
      </tr>
      {isOpen ? (
        <tr>
          <td className="bg-slate-50 px-6 py-4" colSpan={6}>
            <SalesOrderItems items={order.items} />
          </td>
        </tr>
      ) : null}
    </>
  );
}
