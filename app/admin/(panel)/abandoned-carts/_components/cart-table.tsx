import type { AdminAbandonedCart } from "@/types/commerce/abandoned-cart";
import { telHref, whatsappHref } from "@/lib/shop-contact";
import { formatMoney } from "@/utils/admin/format";
import { formatAdminDateTime } from "@/utils/catalog/form-values";
import { AdminIcon } from "../../../_components/admin-icons";
import { IconButton } from "../../_catalog/button";
import { DataTable, StatusPill } from "../../_catalog/table";

const LINK = "font-medium text-slate-700 underline-offset-2 hover:underline";

/** One row per abandoned checkout: who, how to reach them, what was in the bag. */
export function CartTable({ rows, onDelete }: { rows: AdminAbandonedCart[]; onDelete: (row: AdminAbandonedCart) => void }) {
  return (
    <DataTable headings={["Customer", "Items", "Value", "Status", "Last active", ""]}>
      {rows.map((row) => (
        <tr key={row.id} className="align-top odd:bg-white even:bg-slate-50/60">
          <td className="px-4 py-3">
            <span className="block font-semibold text-slate-900">{row.fullName}</span>
            <span className="mt-0.5 flex gap-3 text-xs">
              <a className={LINK} href={telHref(row.phone)}>{row.phone}</a>
              <a className="font-medium text-emerald-700 hover:underline" href={whatsappHref(row.phone)} rel="noopener noreferrer" target="_blank">WhatsApp</a>
            </span>
            {row.email || row.city ? <span className="block text-xs text-slate-500">{[row.email, row.city].filter(Boolean).join(" · ")}</span> : null}
          </td>
          <td className="px-4 py-3 text-slate-700">
            <ul className="space-y-0.5">
              {row.items.map((item) => (
                <li key={item.variantId}>
                  {item.name} <span className="text-slate-500">{[item.color, item.size].filter(Boolean).join(" / ")} × {item.quantity}</span>
                </li>
              ))}
            </ul>
          </td>
          <td className="px-4 py-3 font-semibold tabular-nums text-slate-900">{formatMoney(row.subtotal)}</td>
          <td className="px-4 py-3">
            <StatusPill tone={row.status === "OPEN" ? "amber" : "green"}>{row.status === "OPEN" ? "abandoned" : "recovered"}</StatusPill>
            {row.orderNumber ? <span className="mt-1 block text-xs text-slate-500">{row.orderNumber}</span> : null}
          </td>
          <td className="px-4 py-3 text-slate-600">{formatAdminDateTime(row.updatedAt)}</td>
          <td className="px-4 py-3">
            <IconButton label={`Delete cart from ${row.fullName}`} onClick={() => onDelete(row)}><AdminIcon className="h-4 w-4" name="trash" /></IconButton>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
