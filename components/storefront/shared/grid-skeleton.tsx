/** Placeholder for a product listing while the server renders it. */
export function GridSkeleton() {
  return (
    <div className="page-gutter pt-8 md:pt-12" aria-busy="true" aria-label="Loading products">
      <div className="mb-8 h-12 w-56 animate-pulse rounded bg-selvedge" />
      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index} className="flex flex-col gap-3">
            <div className="aspect-[3/4] animate-pulse bg-selvedge" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-selvedge" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-selvedge" />
          </li>
        ))}
      </ul>
    </div>
  );
}
