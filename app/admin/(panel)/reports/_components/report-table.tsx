import type { ReactNode } from "react";

export type Column = { label: string; align?: "left" | "right" };

/** Plain report table: header row from `columns`, body from children rows. */
export function ReportTable({ columns, children }: { columns: readonly Column[]; children: ReactNode }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400">
          {columns.map((column) => (
            <th className={`px-6 py-4 ${column.align === "right" ? "text-right" : ""}`} key={column.label} scope="col">
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}
