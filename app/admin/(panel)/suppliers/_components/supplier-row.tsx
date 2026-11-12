"use client";

import { formatDate } from "@/utils/format-date";
import { RowActions } from "../../../_components/list/row-actions";
import type { Supplier } from "./supplier-form-modal";

export function SupplierRow({ supplier, onEdit, onDelete }: { supplier: Supplier; onEdit: () => void; onDelete: () => void }) {
  return (
    <tr className="odd:bg-white even:bg-slate-50/70">
      <td className="px-5 py-4 text-sm font-semibold text-slate-800">{supplier.name}</td>
      <td className="px-5 py-4 text-sm text-slate-600">
        {supplier.phone ? <div className="font-medium text-slate-800">{supplier.phone}</div> : null}
        {supplier.email ? <div className="text-xs text-slate-400">{supplier.email}</div> : null}
        {!supplier.phone && !supplier.email ? <span className="text-slate-400">—</span> : null}
      </td>
      <td className="max-w-[200px] truncate px-5 py-4 text-sm text-slate-600">{supplier.address || "—"}</td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${supplier.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}
        >
          {supplier.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-5 py-4 text-sm tabular-nums text-slate-600">{supplier._count?.products ?? 0}</td>
      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(supplier.createdAt)}</td>
      <td className="px-5 py-4">
        <RowActions label={supplier.name} onDelete={onDelete} onEdit={onEdit} />
      </td>
    </tr>
  );
}
