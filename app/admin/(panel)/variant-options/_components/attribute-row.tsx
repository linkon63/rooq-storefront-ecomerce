"use client";

import type { Attribute } from "@/types/admin/catalog";
import { RowActions } from "../../../_components/list/row-actions";

export function AttributeRow({ option, onEdit, onDelete }: { option: Attribute; onEdit: () => void; onDelete: () => void }) {
  const values = option.values ?? [];
  return (
    <tr className="odd:bg-white even:bg-slate-50/70">
      <td className="px-5 py-4 text-sm text-slate-800">{option.name}</td>
      <td className="px-5 py-4">
        <div className="flex max-w-2xl flex-wrap gap-2">
          {values.length > 0 ? (
            values.map((item) => (
              <span className="rounded-md border border-slate-200/50 bg-slate-50 px-2 py-0.5 text-xs font-normal text-slate-600" key={item.id}>
                {item.value}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">No values</span>
          )}
        </div>
      </td>
      <td className="px-5 py-4 text-sm tabular-nums text-slate-600">{values.length} values</td>
      <td className="px-5 py-4">
        <RowActions label={option.name} onDelete={onDelete} onEdit={onEdit} />
      </td>
    </tr>
  );
}
