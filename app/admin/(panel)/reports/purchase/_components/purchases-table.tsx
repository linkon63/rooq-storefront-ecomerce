"use client";

import { formatMoney } from "@/utils/admin/format";
import { formatDate } from "@/utils/format-date";
import { useCurrency } from "@/hooks/use-currency";
import type { PurchaseRow } from "@/types/reports";
import { ReportTable } from "../../_components/report-table";

const COLUMNS = [
  { label: "Date" },
  { label: "Product" },
  { label: "SKU" },
  { label: "Units", align: "right" },
  { label: "Unit cost", align: "right" },
  { label: "Total cost", align: "right" },
  { label: "Note" },
] as const;

export function PurchasesTable({ rows }: { rows: PurchaseRow[] }) {
  const { symbol } = useCurrency();
  return (
    <ReportTable columns={COLUMNS}>
      {rows.map((row) => (
        <tr className="border-b border-slate-50 font-black transition hover:bg-slate-50/50" key={row.id}>
          <td className="px-6 py-4 text-slate-500">{formatDate(row.date)}</td>
          <td className="px-6 py-4">{row.product}</td>
          <td className="px-6 py-4 text-slate-500">{row.sku}</td>
          <td className="px-6 py-4 text-right tabular-nums">{row.quantity}</td>
          <td className="px-6 py-4 text-right tabular-nums">{formatMoney(row.unitCost, symbol)}</td>
          <td className="px-6 py-4 text-right tabular-nums">{formatMoney(row.totalCost, symbol)}</td>
          <td className="px-6 py-4 font-medium text-slate-500">{row.note ?? "—"}</td>
        </tr>
      ))}
    </ReportTable>
  );
}
