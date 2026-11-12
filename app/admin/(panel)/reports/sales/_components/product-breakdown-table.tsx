"use client";

import type { ProductBreakdown } from "@/types/admin/reports";
import { formatMoney } from "@/utils/admin/format";
import { useCurrency } from "@/hooks/use-currency";
import { ReportTable } from "../../_components/report-table";

const COLUMNS = [
  { label: "Product" },
  { label: "SKU" },
  { label: "Units", align: "right" },
  { label: "Revenue", align: "right" },
] as const;

export function ProductBreakdownTable({ rows }: { rows: ProductBreakdown[] }) {
  const { symbol } = useCurrency();
  return (
    <ReportTable columns={COLUMNS}>
      {rows.map((row) => (
        <tr className="border-b border-slate-50 font-black transition hover:bg-slate-50/50" key={row.productId || row.productName}>
          <td className="px-6 py-4">{row.productName}</td>
          <td className="px-6 py-4 text-slate-500">{row.sku}</td>
          <td className="px-6 py-4 text-right tabular-nums">{row.quantity}</td>
          <td className="px-6 py-4 text-right tabular-nums">{formatMoney(row.revenue, symbol)}</td>
        </tr>
      ))}
    </ReportTable>
  );
}
