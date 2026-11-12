"use client";

import { SIZE_GROUPS, SIZE_GROUP_LABELS } from "@/lib/constants/catalog";
import type { AdminSize } from "@/types/catalog-admin";

/** Toggle chips grouped by size group; keeps the master sort order. */
export function SizePicker({ sizes, selected, onChange }: { sizes: AdminSize[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const order = new Map(sizes.map((size, index) => [size.id, index]));
  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    onChange(next.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0)));
  };
  return (
    <div className="grid gap-3">
      {SIZE_GROUPS.map((group) => {
        const list = sizes.filter((size) => size.sizeGroup === group && size.isActive);
        if (!list.length) return null;
        return (
          <fieldset key={group} className="grid gap-2">
            <legend className="mb-1 text-xs font-semibold text-slate-500">{SIZE_GROUP_LABELS[group]}</legend>
            <div className="flex flex-wrap gap-2">
              {list.map((size) => {
                const on = selected.includes(size.id);
                return (
                  <button key={size.id} type="button" aria-pressed={on} onClick={() => toggle(size.id)} className={`min-w-11 rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${on ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"}`}>
                    {size.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
