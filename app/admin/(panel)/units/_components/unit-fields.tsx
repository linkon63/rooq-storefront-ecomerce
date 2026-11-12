"use client";

import type { Unit } from "@/types/admin/catalog";
import { AdminIcon } from "../../../_components/admin-icons";

export type UnitFormState = {
  name: string;
  code: string;
  parentUnitId: string;
  factor: string;
  description: string;
  isActive: boolean;
};

const LABEL = "mb-2 block text-sm font-medium text-slate-700";
const FIELD =
  "h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-[15px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

type Props = { form: UnitFormState; parentOptions: Unit[]; preview: string | null; patch: (changes: Partial<UnitFormState>) => void };

export function UnitFields({ form, parentOptions, preview, patch }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <label className="block">
        <span className={LABEL}>
          Name<span className="text-red-500">*</span>
        </span>
        <input
          autoFocus
          className={FIELD}
          onChange={(event) => patch({ name: event.target.value })}
          placeholder="Enter name"
          required
          value={form.name}
        />
      </label>

      <label className="block">
        <span className={LABEL}>
          Abbreviation<span className="text-red-500">*</span>
        </span>
        <input
          className={FIELD}
          onChange={(event) => patch({ code: event.target.value })}
          placeholder="Enter abbreviation"
          required
          value={form.code}
        />
      </label>

      <label className="block">
        <span className={LABEL}>Parent Unit</span>
        <select
          className={`${FIELD} cursor-pointer appearance-none bg-[length:18px] bg-[right_1rem_center] bg-no-repeat pr-11`}
          onChange={(event) => patch({ parentUnitId: event.target.value })}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
          }}
          value={form.parentUnitId}
        >
          <option value="">None — this is a base unit</option>
          {parentOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name} ({option.code})
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={LABEL}>
          Factor<span className="text-red-500">*</span>
        </span>
        <input
          className={`${FIELD} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}
          disabled={!form.parentUnitId}
          min="0"
          onChange={(event) => patch({ factor: event.target.value })}
          required
          step="any"
          title={
            form.parentUnitId
              ? "How many parent units one of this unit equals"
              : "A base unit is always 1 of itself"
          }
          type="number"
          value={form.parentUnitId ? form.factor : "1"}
        />
      </label>

      <label className="block md:col-span-2">
        <span className={LABEL}>Description</span>
        <textarea
          className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          onChange={(event) => patch({ description: event.target.value })}
          placeholder="Sold as a pair of socks or shoes"
          value={form.description}
        />
      </label>

      <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            checked={form.isActive}
            className="h-4 w-4 accent-blue-600"
            onChange={(event) => patch({ isActive: event.target.checked })}
            type="checkbox"
          />
          Active unit
        </label>

        {preview && (
          <p className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
            <AdminIcon className="h-4 w-4" name="info" />
            {preview}
          </p>
        )}
      </div>
    </div>
  );
}
