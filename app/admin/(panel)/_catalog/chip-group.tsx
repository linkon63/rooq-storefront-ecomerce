"use client";

import { toggleInList } from "@/utils/catalog/form-values";

export type ChipOption<T extends string> = { value: T; label: string };

/** Multi-select as toggle chips (tags, collections, occasions). */
export function ChipGroup<T extends string>({ label, options, selected, onChange, empty }: { label: string; options: ChipOption<T>[]; selected: T[]; onChange: (next: T[]) => void; empty?: string }) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium text-slate-700">{label}</legend>
      {options.length ? (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const on = selected.includes(option.value);
            return (
              <button key={option.value} type="button" aria-pressed={on} onClick={() => onChange(toggleInList(selected, option.value))} className={`rounded-full border px-3 py-1 text-sm transition ${on ? "border-blue-600 bg-blue-50 font-semibold text-blue-800" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"}`}>
                {option.label}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{empty}</p>
      )}
    </fieldset>
  );
}
