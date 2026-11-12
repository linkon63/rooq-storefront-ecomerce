const clamp = (value: number) => Math.min(5, Math.max(0, Math.round(value)));

export function StarRating({ rating }: { rating: number }) {
  const filled = clamp(rating);
  return (
    <span aria-label={`${filled} out of 5 stars`} className="inline-flex text-sm font-semibold text-amber-500" role="img">
      {"★".repeat(filled)}
      <span className="text-slate-300">{"★".repeat(5 - filled)}</span>
    </span>
  );
}
