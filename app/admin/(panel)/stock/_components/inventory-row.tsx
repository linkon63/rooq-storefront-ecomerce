import type { AdminInventoryRow } from "@/types/catalog-admin";
import { AdminIcon } from "../../../_components/admin-icons";
import { Button, IconButton } from "../../_catalog/button";
import { StatusPill } from "../../_catalog/table";
import { Swatch } from "../../_catalog/swatch";

function stockPill(row: AdminInventoryRow) {
  if (row.isOutOfStock) return <StatusPill tone="red">Out of stock</StatusPill>;
  if (row.isLowStock) return <StatusPill tone="amber">Low · {row.stock} left</StatusPill>;
  return <StatusPill tone="green">In stock</StatusPill>;
}

export function InventoryRowView({ row, onAdjust, onHistory }: { row: AdminInventoryRow; onAdjust: () => void; onHistory: () => void }) {
  return (
    <tr className="odd:bg-white even:bg-slate-50/60">
      <td className="px-4 py-3">
        <span className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {row.imageUrl ? <img src={row.imageUrl} alt="" className="h-12 w-10 rounded object-cover" loading="lazy" /> : <span className="h-12 w-10 rounded bg-slate-100" />}
          <span>
            <span className="block font-medium text-slate-900">{row.product.name}</span>
            {row.isActive ? null : <span className="text-xs text-slate-500">Archived variant</span>}
          </span>
        </span>
      </td>
      <td className="px-4 py-3"><span className="flex items-center gap-2 text-slate-700"><Swatch size="sm" hex={row.color.hex} name={row.color.name} />{row.color.name} / {row.size.label}</span></td>
      <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.sku}</td>
      <td className="px-4 py-3 text-right text-base font-semibold tabular-nums text-slate-900">{row.stock}</td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-500">{row.lowStockThreshold}</td>
      <td className="px-4 py-3">{stockPill(row)}</td>
      <td className="px-4 py-3">
        <span className="flex items-center justify-end gap-1">
          <Button tone="secondary" className="h-8" onClick={onAdjust}>Adjust</Button>
          <IconButton label={`Stock history for ${row.sku}`} onClick={onHistory}><AdminIcon className="h-4 w-4" name="report" /></IconButton>
        </span>
      </td>
    </tr>
  );
}
