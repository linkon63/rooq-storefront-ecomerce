import type { ReactNode } from "react";

export const INPUT_CLASS =
  "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white";
export const TEXTAREA_CLASS =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium outline-none transition-colors focus:border-blue-500 focus:bg-white";

/** Label + control wrapper used by admin forms. */
export function FormField({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
