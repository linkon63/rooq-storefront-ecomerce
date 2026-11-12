import type { ReactNode } from "react";

/** A labelled row of KPI tiles on the overview page. */
export function OverviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 first-of-type:mt-6">
      <h2 className="mb-4 text-xl font-black text-slate-700">{title}</h2>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}
