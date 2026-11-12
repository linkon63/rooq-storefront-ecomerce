"use client";

import type { DiscountedOrder } from "@/types/admin/reports";
import { formatMoney } from "@/utils/admin/format";
import { formatDate } from "@/utils/format-date";
import { useCurrency } from "@/hooks/use-currency";
import { ReportTable } from "../../_components/report-table";

const COLUMNS = [
  { label: "Order" },
  { label: "Customer" },
  { label: "Coupon", align: "right" },
  { label: "Offer", align: "right" },
  { label: "Total", align: "right" },
  { label: "Date" },
] as const;

export function DiscountedOrdersTable({ orders }: { orders: DiscountedOrder[] }) {
  const { symbol } = useCurrency();
  const money = (value: number | undefined) => (value ? `-${formatMoney(value, symbol)}` : "—");
  return (
    <ReportTable columns={COLUMNS}>
      {orders.map((order) => (
        <tr className="border-b border-slate-50 font-black transition hover:bg-slate-50/50" key={order.orderId}>
          <td className="px-6 py-4">{order.orderNumber}</td>
          <td className="px-6 py-4 text-slate-600">{order.customer}</td>
          <td className="px-6 py-4 text-right tabular-nums text-rose-600">{money(order.couponDiscount)}</td>
          <td className="px-6 py-4 text-right tabular-nums text-rose-600">{money(order.productDiscount)}</td>
          <td className="px-6 py-4 text-right tabular-nums">{formatMoney(order.orderTotal, symbol)}</td>
          <td className="px-6 py-4 text-slate-500">{formatDate(order.placedAt)}</td>
        </tr>
      ))}
    </ReportTable>
  );
}
