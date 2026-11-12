import type { ReviewSummary as Summary } from "@/types/storefront/commerce";
import { formatRating } from "@/utils/storefront/reviews";
import { StarRating } from "../shared/star-rating";
import { FitMeter } from "./fit-meter";

const STARS = ["5", "4", "3", "2", "1"] as const;

export function ReviewSummary({ summary }: { summary: Summary }) {
  return (
    <div className="grid gap-8 md:grid-cols-[auto_1fr_1fr] md:items-start">
      <div>
        <p className="font-expanded text-5xl font-extrabold leading-none tabular-nums">{formatRating(summary.average)}</p>
        <div className="mt-2">
          <StarRating rating={summary.average} size={16} />
        </div>
        <p className="mt-1 text-sm text-stone">{summary.count} reviews</p>
      </div>
      <ul className="flex flex-col gap-1.5" aria-label="Ratings breakdown">
        {STARS.map((star) => {
          const count = summary.distribution[star] ?? 0;
          const share = summary.count > 0 ? Math.round((count / summary.count) * 100) : 0;
          return (
            <li key={star} className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 text-sm tabular-nums">
              <span>{star} star</span>
              <span className="h-1.5 rounded-full bg-selvedge" aria-hidden>
                <span className="block h-full rounded-full bg-ink" style={{ width: `${share}%` }} />
              </span>
              <span className="text-right text-stone">
                {count}
                <span className="sr-only"> reviews</span>
              </span>
            </li>
          );
        })}
      </ul>
      <FitMeter fit={summary.fit} />
    </div>
  );
}
