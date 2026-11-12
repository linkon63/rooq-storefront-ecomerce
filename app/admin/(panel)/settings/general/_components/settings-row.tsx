import type { ReactNode } from "react";

/** Left label + hint, right content — one block of the General page. */
export function SettingsRow({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="px-6 py-7 sm:px-8">
      <div className="grid gap-x-8 gap-y-4 sm:grid-cols-[220px_1fr]">
        <div className="pt-1">
          <h2 className="text-sm font-black text-slate-800">{label}</h2>
          {hint ? <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{hint}</p> : null}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
