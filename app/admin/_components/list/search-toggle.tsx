"use client";

import { useState } from "react";
import { AdminIcon } from "../admin-icons";

type Props = { value: string; onChange: (value: string) => void; label: string };

/** Header search: an icon button that expands into an input; closing clears the query. */
export function SearchToggle({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(Boolean(value));
  if (!open) {
    return (
      <button
        aria-label={label}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50"
        onClick={() => setOpen(true)}
        title={label}
        type="button"
      >
        <AdminIcon className="h-5 w-5 text-slate-600" name="search" />
      </button>
    );
  }
  return (
    <div className="relative flex h-11 w-64 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
      <input
        aria-label={label}
        autoFocus
        className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
        onChange={(event) => onChange(event.target.value)}
        placeholder={`${label}…`}
        type="search"
        value={value}
      />
      <button
        aria-label="Close search"
        className="grid h-6 w-6 place-items-center rounded-md text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
        onClick={() => {
          onChange("");
          setOpen(false);
        }}
        type="button"
      >
        <AdminIcon className="h-4 w-4" name="x" />
      </button>
    </div>
  );
}
