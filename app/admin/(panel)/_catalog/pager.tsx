import { Button } from "./button";

export function Pager({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (page: number) => void }) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
      <span>
        Page {page} of {totalPages} · {total} total
      </span>
      <span className="flex gap-2">
        <Button tone="secondary" className="h-8" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </Button>
        <Button tone="secondary" className="h-8" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
          Next
        </Button>
      </span>
    </nav>
  );
}
