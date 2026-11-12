/** Trend pill. `goodWhenDown` flips the tone for metrics where a rise is bad. */
export function TrendBadge({ trend, goodWhenDown = false }: { trend: number | null; goodWhenDown?: boolean }) {
  if (trend === null) {
    return <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-slate-400">—</span>;
  }
  const isUp = trend >= 0;
  const isGood = goodWhenDown ? !isUp : isUp;
  const tone = isGood ? "border-emerald-300 bg-emerald-50 text-emerald-600" : "border-rose-300 bg-rose-50 text-rose-600";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 tabular-nums ${tone}`}>
      <svg
        aria-hidden
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        style={{ transform: isUp ? "none" : "scaleY(-1)" }}
        viewBox="0 0 24 24"
      >
        <path d="M4 17l6-6 4 4 6-6" />
        <path d="M16 9h4v4" />
      </svg>
      <span className="sr-only">{isUp ? "Up" : "Down"}</span>
      {Math.abs(trend)}%
    </span>
  );
}
