/** Pure helpers for the product review summary (rating aggregate + fit verdict). */

export type FitFeedbackValue = "RUNS_SMALL" | "TRUE_TO_SIZE" | "RUNS_LARGE";
export type RatingValue = 1 | 2 | 3 | 4 | 5;

export type FitSummary = Record<FitFeedbackValue, number> & {
  total: number;
  verdict: FitFeedbackValue | null;
};

export type ReviewSummary = {
  average: number;
  count: number;
  distribution: Record<RatingValue, number>;
  fit: FitSummary;
};

const RATINGS: readonly RatingValue[] = [1, 2, 3, 4, 5];
/** Tie-break order: when counts are equal, "true to size" is the safest verdict. */
const FIT_PRIORITY: readonly FitFeedbackValue[] = ["TRUE_TO_SIZE", "RUNS_SMALL", "RUNS_LARGE"];

export const roundRating = (value: number) => Math.round(value * 100) / 100;

/** `[{ rating, count }]` → `{ 1: n, …, 5: n }`, ignoring out-of-range ratings. */
export function ratingDistribution(rows: readonly { rating: number; count: number }[]): Record<RatingValue, number> {
  const distribution: Record<RatingValue, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of rows) {
    const rating = RATINGS.find((value) => value === row.rating);
    if (rating) distribution[rating] += row.count;
  }
  return distribution;
}

/** Average of a distribution, rounded to 2 dp (0 when there are no ratings). */
export function averageRating(distribution: Record<RatingValue, number>): { average: number; count: number } {
  let count = 0;
  let sum = 0;
  for (const rating of RATINGS) {
    count += distribution[rating];
    sum += rating * distribution[rating];
  }
  return { average: count ? roundRating(sum / count) : 0, count };
}

/** `[{ fitFeedback, count }]` → fit counts plus the majority verdict. */
export function fitSummary(rows: readonly { fitFeedback: FitFeedbackValue | null; count: number }[]): FitSummary {
  const summary: FitSummary = { RUNS_SMALL: 0, TRUE_TO_SIZE: 0, RUNS_LARGE: 0, total: 0, verdict: null };
  for (const row of rows) {
    if (!row.fitFeedback) continue;
    summary[row.fitFeedback] += row.count;
    summary.total += row.count;
  }
  if (summary.total > 0) {
    summary.verdict = FIT_PRIORITY.reduce((best, value) => (summary[value] > summary[best] ? value : best));
  }
  return summary;
}

export function buildReviewSummary(
  ratingRows: readonly { rating: number; count: number }[],
  fitRows: readonly { fitFeedback: FitFeedbackValue | null; count: number }[],
): ReviewSummary {
  const distribution = ratingDistribution(ratingRows);
  const { average, count } = averageRating(distribution);
  return { average, count, distribution, fit: fitSummary(fitRows) };
}
