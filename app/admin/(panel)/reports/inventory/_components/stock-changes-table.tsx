import { formatDate } from "@/utils/format-date";
import type { InventoryStockChange } from "@/types/reports";
import { ReportTable } from "../../_components/report-table";

const COLUMNS = [
  { label: "Date" },
  { label: "Product" },
  { label: "Colour / size" },
  { label: "Change", align: "right" },
  { label: "Reason" },
  { label: "Stock after", align: "right" },
] as const;

export function StockChangesTable({ rows }: { rows: InventoryStockChange[] }) {
  return (
    <ReportTable columns={COLUMNS}>
      {rows.map((row) => (
        <tr className="border-b border-slate-50 font-black transition hover:bg-slate-50/50" key={row.id}>
          <td className="px-6 py-4 text-slate-500">{formatDate(row.date)}</td>
          <td className="px-6 py-4">
            {row.product}
            <span className="block text-xs font-medium text-slate-400">{row.sku}</span>
          </td>
          <td className="px-6 py-4 text-slate-600">
            {row.color} / {row.size}
          </td>
          <td className={`px-6 py-4 text-right tabular-nums ${row.change < 0 ? "text-rose-600" : "text-emerald-600"}`}>
            {row.change > 0 ? `+${row.change}` : row.change}
          </td>
          <td className="px-6 py-4 capitalize text-slate-600">
            {row.reason}
            {row.note ? <span className="block text-xs font-medium normal-case text-slate-400">{row.note}</span> : null}
          </td>
          <td className="px-6 py-4 text-right tabular-nums">{row.stockAfter}</td>
        </tr>
      ))}
    </ReportTable>
  );
}
