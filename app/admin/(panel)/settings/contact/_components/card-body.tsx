import type { ReactNode } from "react";

/** Left heading + hint, right fields — the layout inside each contact card. */
export function CardBody({ heading, hint, children }: { heading: string; hint: string; children: ReactNode }) {
  return (
    <div className="grid gap-x-8 gap-y-5 sm:grid-cols-[220px_1fr]">
      <div className="pt-1">
        <p className="text-sm font-black text-slate-800">{heading}</p>
        <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{hint}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
