"use client";

import type { SalesReportOrder } from "@/types/admin/reports";
import { formatMoney } from "@/utils/admin/format";
import { useCurrency } from "@/hooks/use-currency";

export function SalesOrderItems({ items }: { items: SalesReportOrder["items"] }) {
  const { symbol } = useCurrency();
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs font-black uppercase text-slate-400">
          <th className="px-4 py-2 text-left">Product</th>
          <th className="px-4 py-2 text-left">SKU</th>
          <th className="px-4 py-2 text-right">Qty</th>
          <th className="px-4 py-2 text-right">Unit price</th>
          <th className="px-4 py-2 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr className="font-medium text-slate-600" key={`${item.sku}-${item.product}`}>
            <td className="px-4 py-2">{item.product}</td>
            <td className="px-4 py-2">{item.sku}</td>
            <td className="px-4 py-2 text-right tabular-nums">{item.quantity}</td>
            <td className="px-4 py-2 text-right tabular-nums">{formatMoney(item.unitPrice, symbol)}</td>
            <td className="px-4 py-2 text-right tabular-nums">{formatMoney(item.totalPrice, symbol)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
