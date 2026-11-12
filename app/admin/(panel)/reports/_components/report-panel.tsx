import type { ReactNode } from "react";

/**
 * A titled report section that owns its loading and empty states, so pages
 * only describe the populated table.
 */
export function ReportPanel({
  title,
  isLoading,
  isEmpty,
  emptyText,
  action,
  children,
}: {
  title: string;
  isLoading: boolean;
  isEmpty: boolean;
  emptyText: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-black">{title}</h2>
        {action}
      </div>
      {isLoading ? (
        <div className="space-y-4 p-6" aria-busy>
          {Array.from({ length: 4 }, (_, index) => (
            <div className="h-12 animate-pulse rounded bg-slate-100" key={index} />
          ))}
        </div>
      ) : isEmpty ? (
        <p className="p-6 text-center font-medium text-slate-400">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </section>
  );
}
