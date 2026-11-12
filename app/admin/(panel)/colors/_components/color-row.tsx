import type { AdminColor } from "@/types/catalog-admin";
import { AdminIcon } from "../../../_components/admin-icons";
import { IconButton } from "../../_catalog/button";
import { StatusPill } from "../../_catalog/table";
import { Swatch } from "../../_catalog/swatch";

export function ColorRow({ color, onEdit, onDelete }: { color: AdminColor; onEdit: () => void; onDelete: () => void }) {
  return (
    <tr className="odd:bg-white even:bg-slate-50/60">
      <td className="px-4 py-3">
        <span className="flex items-center gap-3 font-medium text-slate-900">
          <Swatch hex={color.hex} name={color.name} />
          {color.name}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-slate-600">{color.hex}</td>
      <td className="px-4 py-3 text-slate-600">{color.family ?? "—"}</td>
      <td className="px-4 py-3 tabular-nums text-slate-600">{color.variantCount}</td>
      <td className="px-4 py-3 tabular-nums text-slate-600">{color.sortOrder}</td>
      <td className="px-4 py-3">{color.isActive ? <StatusPill tone="green">Active</StatusPill> : <StatusPill tone="slate">Hidden</StatusPill>}</td>
      <td className="px-4 py-3">
        <span className="flex gap-1">
          <IconButton label={`Edit ${color.name}`} onClick={onEdit}><AdminIcon className="h-4 w-4" name="edit" /></IconButton>
          <IconButton label={`Delete ${color.name}`} onClick={onDelete} disabled={color.variantCount > 0}><AdminIcon className="h-4 w-4" name="trash" /></IconButton>
        </span>
      </td>
    </tr>
  );
}
