"use client";

import { AdminIcon } from "../../../_components/admin-shell";

export function ReviewSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-10 w-full max-w-xs items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      <AdminIcon className="h-4 w-4 shrink-0 text-slate-400" name="search" />
      <span className="sr-only">Search reviews</span>
      <input
        className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by comment, product or customer…"
        type="search"
        value={value}
      />
    </label>
  );
}
