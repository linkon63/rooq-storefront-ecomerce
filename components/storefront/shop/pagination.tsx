import Link from "next/link";
import type { PaginationMeta } from "@/types/storefront/catalog";
import { pageNumbers } from "@/utils/storefront/pages";

/** Numbered page links (real <a> for crawlers and middle-click). */
export function Pagination({ meta, hrefFor }: { meta: PaginationMeta; hrefFor: (page: number) => string }) {
  if (meta.totalPages <= 1) return null;
  const pages = pageNumbers(meta.page, meta.totalPages);
  const cell = "grid h-10 min-w-10 place-items-center rounded px-3 text-sm font-semibold tabular-nums";
  return (
    <nav aria-label="Pages" className="mt-12 flex justify-center">
      <ul className="flex items-center gap-1">
        {meta.page > 1 ? (
          <li>
            <Link href={hrefFor(meta.page - 1)} className={`${cell} hover:bg-selvedge`} rel="prev">
              Previous
            </Link>
          </li>
        ) : null}
        {pages.map((page, index) =>
          page === null ? (
            <li key={`gap-${index}`} aria-hidden className="px-1 text-stone">
              …
            </li>
          ) : (
            <li key={page}>
              <Link
                href={hrefFor(page)}
                aria-current={page === meta.page ? "page" : undefined}
                className={`${cell} ${page === meta.page ? "bg-ink text-chalk" : "hover:bg-selvedge"}`}
              >
                {page}
              </Link>
            </li>
          ),
        )}
        {meta.page < meta.totalPages ? (
          <li>
            <Link href={hrefFor(meta.page + 1)} className={`${cell} hover:bg-selvedge`} rel="next">
              Next
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
