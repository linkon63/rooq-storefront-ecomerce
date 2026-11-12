import type { AdminBackInStock } from "@/types/catalog-admin";
import { formatAdminDateTime } from "@/utils/catalog/form-values";
import { AdminIcon } from "../../../_components/admin-icons";
import { IconButton } from "../../_catalog/button";
import { DataTable, StatusPill } from "../../_catalog/table";
import { Swatch } from "../../_catalog/swatch";

const STATUS_TONE = { PENDING: "amber", NOTIFIED: "green", CANCELLED: "slate" } as const;

export function RequestTable({ rows, onDelete }: { rows: AdminBackInStock[]; onDelete: (row: AdminBackInStock) => void }) {
  return (
    <DataTable headings={["Email", "Product", "Variant", "Status", "Requested", "Notified", ""]}>
      {rows.map((row) => (
        <tr key={row.id} className="odd:bg-white even:bg-slate-50/60">
          <td className="px-4 py-3 text-slate-900">{row.email}{row.user ? <span className="block text-xs text-slate-500">{row.user.name}</span> : null}</td>
          <td className="px-4 py-3 text-slate-700">{row.variant.product.name}</td>
          <td className="px-4 py-3">
            <span className="flex items-center gap-2 text-slate-600"><Swatch size="sm" hex={row.variant.color.hex} name={row.variant.color.name} />{row.variant.color.name} / {row.variant.size.label}</span>
          </td>
          <td className="px-4 py-3"><StatusPill tone={STATUS_TONE[row.status]}>{row.status.toLowerCase()}</StatusPill></td>
          <td className="px-4 py-3 text-slate-600">{formatAdminDateTime(row.createdAt)}</td>
          <td className="px-4 py-3 text-slate-600">{formatAdminDateTime(row.notifiedAt)}</td>
          <td className="px-4 py-3"><IconButton label={`Delete request from ${row.email}`} onClick={() => onDelete(row)}><AdminIcon className="h-4 w-4" name="trash" /></IconButton></td>
        </tr>
      ))}
    </DataTable>
  );
}
