"use client";

import type { PaginationMeta } from "@/types/admin/reports";

/** Previous / next controls for a paginated report list. */
export function Pager({ meta, onPage }: { meta: PaginationMeta | undefined; onPage: (page: number) => void }) {
  if (!meta || meta.total <= meta.limit) return null;
  const pages = Math.max(1, Math.ceil(meta.total / meta.limit));
  const button =
    "h-9 rounded-lg border border-slate-300 px-4 text-sm font-black transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <nav aria-label="Pagination" className="flex items-center gap-3 text-sm font-black text-slate-500">
      <button className={button} disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)} type="button">
        Previous
      </button>
      <span className="tabular-nums">
        Page {meta.page} of {pages}
      </span>
      <button className={button} disabled={meta.page >= pages} onClick={() => onPage(meta.page + 1)} type="button">
        Next
      </button>
    </nav>
  );
}
