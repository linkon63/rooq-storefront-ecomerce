import type { ReactNode } from "react";

export function DataTable({ headings, children, minWidth = 760 }: { headings: string[]; children: ReactNode; minWidth?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            {headings.map((heading, index) => (
              <th key={`${heading}-${index}`} scope="col" className="px-4 py-3 font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/60">{children}</section>;
}

export function StatusPill({ tone, children }: { tone: "green" | "amber" | "red" | "slate" | "blue"; children: ReactNode }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${tones[tone]}`}>{children}</span>;
}
