import { FIT_FEEDBACK_LABELS } from "@/lib/constants/storefront";
import type { FitSummary } from "@/types/storefront/catalog";
import { FIT_SCALE, fitAdvice, fitMarkerPosition } from "@/utils/storefront/reviews";

/** Runs small — true to size — runs large, with a marker where reviewers land. */
export function FitMeter({ fit }: { fit: FitSummary }) {
  if (fit.total === 0) return null;
  const position = fitMarkerPosition(fit);
  const advice = fitAdvice(fit.verdict);
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">How it fits</p>
      <div
        className="relative h-1.5 rounded-full bg-selvedge"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={position}
        aria-valuetext={advice ?? undefined}
        aria-label="Fit from reviews"
      >
        <span
          aria-hidden
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-paper bg-ink"
          style={{ left: `${position}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-stone">
        {FIT_SCALE.map((value) => (
          <span key={value}>{FIT_FEEDBACK_LABELS[value]}</span>
        ))}
      </div>
      {advice ? <p className="mt-2 text-sm">{advice} Based on {fit.total} reviews.</p> : null}
    </div>
  );
}
