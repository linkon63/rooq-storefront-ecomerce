import { SIZE_GROUP_LABELS } from "@/lib/constants/catalog";
import type { AdminSize, SizeGroup } from "@/types/catalog-admin";
import { AdminIcon } from "../../../_components/admin-icons";
import { Button, IconButton } from "../../_catalog/button";
import { Card, StatusPill } from "../../_catalog/table";

type Props = {
  group: SizeGroup;
  sizes: AdminSize[];
  busy: boolean;
  onAdd: () => void;
  onEdit: (size: AdminSize) => void;
  onDelete: (size: AdminSize) => void;
  onMove: (index: number, step: -1 | 1) => void;
};

export function SizeGroupCard({ group, sizes, busy, onAdd, onEdit, onDelete, onMove }: Props) {
  return (
    <Card>
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="font-semibold text-slate-900">{SIZE_GROUP_LABELS[group]}</h2>
        <Button tone="secondary" className="h-8" onClick={onAdd}><AdminIcon className="h-4 w-4" name="plus" />Add</Button>
      </header>
      {sizes.length ? (
        <ol className="divide-y divide-slate-100">
          {sizes.map((size, index) => (
            <li key={size.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
              <span className="w-6 tabular-nums text-slate-400">{index + 1}</span>
              <span className="min-w-12 font-semibold text-slate-900">{size.label}</span>
              <span className="text-xs text-slate-500">{size.variantCount} variants · {size.sizeChartCount} charts</span>
              {size.isActive ? null : <StatusPill tone="slate">Hidden</StatusPill>}
              <span className="ml-auto flex gap-1">
                <IconButton label={`Move ${size.label} up`} disabled={busy || index === 0} onClick={() => onMove(index, -1)}><AdminIcon className="h-4 w-4 -rotate-90" name="arrow-right" /></IconButton>
                <IconButton label={`Move ${size.label} down`} disabled={busy || index === sizes.length - 1} onClick={() => onMove(index, 1)}><AdminIcon className="h-4 w-4 rotate-90" name="arrow-right" /></IconButton>
                <IconButton label={`Edit ${size.label}`} onClick={() => onEdit(size)}><AdminIcon className="h-4 w-4" name="edit" /></IconButton>
                <IconButton label={`Delete ${size.label}`} disabled={size.variantCount + size.sizeChartCount > 0} onClick={() => onDelete(size)}><AdminIcon className="h-4 w-4" name="trash" /></IconButton>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-4 py-6 text-sm text-slate-500">No sizes in this group yet.</p>
      )}
    </Card>
  );
}
