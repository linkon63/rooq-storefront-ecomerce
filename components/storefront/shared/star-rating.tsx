import { formatRating, starFills } from "@/utils/storefront/reviews";

const STAR_PATH = "M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z";

/** Read-only stars with an accessible label ("4.5 out of 5"). */
export function StarRating({ rating, size = 14, count }: { rating: number; size?: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex" role="img" aria-label={`Rated ${formatRating(rating)} out of 5`}>
        {starFills(rating).map((fill, index) => (
          <svg key={index} width={size} height={size} viewBox="0 0 20 20" aria-hidden>
            <defs>
              <linearGradient id={`star-${index}-${Math.round(fill * 100)}`}>
                <stop offset={`${fill * 100}%`} stopColor="currentColor" />
                <stop offset={`${fill * 100}%`} stopColor="var(--color-line)" />
              </linearGradient>
            </defs>
            <path d={STAR_PATH} fill={`url(#star-${index}-${Math.round(fill * 100)})`} className="text-ink" />
          </svg>
        ))}
      </span>
      {count !== undefined ? <span className="text-xs text-stone">({count})</span> : null}
    </span>
  );
}
