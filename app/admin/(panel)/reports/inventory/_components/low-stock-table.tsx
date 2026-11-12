import type { InventoryLowStockRow } from "@/types/reports";
import { ReportTable } from "../../_components/report-table";

const COLUMNS = [
  { label: "Product" },
  { label: "Colour / size" },
  { label: "SKU" },
  { label: "In stock", align: "right" },
  { label: "Alert at", align: "right" },
] as const;

export function LowStockTable({ rows }: { rows: InventoryLowStockRow[] }) {
  return (
    <ReportTable columns={COLUMNS}>
      {rows.map((row) => (
        <tr className="border-b border-slate-50 font-black transition hover:bg-slate-50/50" key={row.sku}>
          <td className="px-6 py-4">{row.product}</td>
          <td className="px-6 py-4 text-slate-600">
            {row.color} / {row.size}
          </td>
          <td className="px-6 py-4 text-slate-500">{row.sku}</td>
          <td className={`px-6 py-4 text-right tabular-nums ${row.currentStock <= 0 ? "text-rose-600" : "text-amber-600"}`}>
            {row.currentStock <= 0 ? "Sold out" : row.currentStock}
          </td>
          <td className="px-6 py-4 text-right tabular-nums text-slate-500">{row.alertThreshold}</td>
        </tr>
      ))}
    </ReportTable>
  );
}
