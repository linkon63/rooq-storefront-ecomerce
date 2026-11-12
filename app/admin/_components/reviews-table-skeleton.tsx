export function ReviewsTableSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Customer", "Product", "Rating", "Review", "Status", "Actions"].map((heading) => (
                <th className="px-4 py-2.5 text-sm font-semibold text-slate-700" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <td className="px-4 py-3" key={j}>
                    <div className="h-5 w-full max-w-28 animate-pulse rounded bg-slate-100" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
