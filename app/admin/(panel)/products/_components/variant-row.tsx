"use client";

import type { AdminVariant } from "@/types/catalog-admin";
import type { VariantDraft } from "@/utils/catalog/variant-drafts";
import { AdminIcon } from "../../../_components/admin-icons";
import { IconButton } from "../../_catalog/button";
import { inputClass } from "../../_catalog/field";
import { Swatch } from "../../_catalog/swatch";

type Props = {
  variant: AdminVariant;
  draft: VariantDraft;
  selected: boolean;
  dirty: boolean;
  onSelect: (on: boolean) => void;
  onChange: (patch: Partial<VariantDraft>) => void;
  onDelete: () => void;
};

const cell = `${inputClass} h-8 px-2 tabular-nums`;

export function VariantRow({ variant, draft, selected, dirty, onSelect, onChange, onDelete }: Props) {
  const label = `${variant.color.name} / ${variant.size.label}`;
  return (
    <tr className={dirty ? "bg-amber-50/60" : variant.isActive ? "bg-white" : "bg-slate-50 text-slate-400"}>
      <td className="px-3 py-2"><input type="checkbox" aria-label={`Select ${label}`} className="h-4 w-4 accent-blue-600" checked={selected} onChange={(e) => onSelect(e.target.checked)} /></td>
      <td className="px-3 py-2">
        <span className="flex items-center gap-2 whitespace-nowrap font-medium text-slate-800">
          <Swatch size="sm" hex={variant.color.hex} name={variant.color.name} />{label}
          {variant.isDefault ? <span className="rounded bg-blue-50 px-1.5 text-[11px] font-semibold text-blue-700">default</span> : null}
        </span>
      </td>
      <td className="px-2 py-2"><input aria-label={`SKU for ${label}`} className={`${cell} w-44 font-mono text-xs`} value={draft.sku} onChange={(e) => onChange({ sku: e.target.value })} /></td>
      <td className="px-2 py-2"><input aria-label={`Barcode for ${label}`} className={`${cell} w-32`} value={draft.barcode} onChange={(e) => onChange({ barcode: e.target.value })} /></td>
      <td className="px-2 py-2"><input aria-label={`Price for ${label}`} placeholder={String(variant.price)} inputMode="decimal" className={`${cell} w-24`} value={draft.price} onChange={(e) => onChange({ price: e.target.value })} /></td>
      <td className="px-2 py-2"><input aria-label={`Compare-at for ${label}`} inputMode="decimal" className={`${cell} w-24`} value={draft.compareAtPrice} onChange={(e) => onChange({ compareAtPrice: e.target.value })} /></td>
      <td className="px-2 py-2"><input aria-label={`Stock for ${label}`} inputMode="numeric" className={`${cell} w-20`} value={draft.stock} onChange={(e) => onChange({ stock: e.target.value })} /></td>
      <td className="px-2 py-2"><input aria-label={`Low-stock alert for ${label}`} inputMode="numeric" className={`${cell} w-16`} value={draft.lowStockThreshold} onChange={(e) => onChange({ lowStockThreshold: e.target.value })} /></td>
      <td className="px-3 py-2"><input type="checkbox" aria-label={`${label} on sale`} className="h-4 w-4 accent-blue-600" checked={draft.isActive} onChange={(e) => onChange({ isActive: e.target.checked })} /></td>
      <td className="px-2 py-2"><IconButton label={`Delete ${label}`} onClick={onDelete}><AdminIcon className="h-4 w-4" name="trash" /></IconButton></td>
    </tr>
  );
}
