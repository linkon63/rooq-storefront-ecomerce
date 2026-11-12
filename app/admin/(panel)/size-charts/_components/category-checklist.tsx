"use client";

import type { CategoryOption } from "@/utils/catalog/category-options";
import { toggleInList } from "@/utils/catalog/form-values";

export function CategoryChecklist({ options, selected, onChange }: { options: CategoryOption[]; selected: string[]; onChange: (ids: string[]) => void }) {
  if (!options.length) return <p className="text-sm text-slate-500">No categories yet.</p>;
  return (
    <ul className="grid max-h-64 gap-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
      {options.map((option) => (
        <li key={option.id} style={{ paddingLeft: option.depth * 16 }}>
          <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-50">
            <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={selected.includes(option.id)} onChange={() => onChange(toggleInList(selected, option.id))} />
            {option.name}
          </label>
        </li>
      ))}
    </ul>
  );
}
