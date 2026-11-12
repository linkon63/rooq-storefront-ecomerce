import { FIT_FEEDBACK_LABELS } from "@/lib/constants/storefront";
import type { FitFeedback, FitSummary } from "@/types/storefront/catalog";

export const FIT_SCALE: readonly FitFeedback[] = ["RUNS_SMALL", "TRUE_TO_SIZE", "RUNS_LARGE"];

/** Share of reviewers who picked each fit, in whole percent. */
export function fitShares(fit: FitSummary): Record<FitFeedback, number> {
  const share = (value: number) => (fit.total > 0 ? Math.round((value / fit.total) * 100) : 0);
  return { RUNS_SMALL: share(fit.RUNS_SMALL), TRUE_TO_SIZE: share(fit.TRUE_TO_SIZE), RUNS_LARGE: share(fit.RUNS_LARGE) };
}

/**
 * Position of the fit marker on a 0–100 scale (0 = runs small, 50 = true to
 * size, 100 = runs large), weighted by the votes.
 */
export function fitMarkerPosition(fit: FitSummary): number {
  if (fit.total === 0) return 50;
  return Math.round(((fit.TRUE_TO_SIZE * 50 + fit.RUNS_LARGE * 100) / fit.total) * 10) / 10;
}

/** "Most people say it runs small: consider a size up." */
export function fitAdvice(verdict: FitFeedback | null): string | null {
  if (verdict === "RUNS_SMALL") return `${FIT_FEEDBACK_LABELS.RUNS_SMALL}: consider a size up.`;
  if (verdict === "RUNS_LARGE") return `${FIT_FEEDBACK_LABELS.RUNS_LARGE}: consider a size down.`;
  if (verdict === "TRUE_TO_SIZE") return `${FIT_FEEDBACK_LABELS.TRUE_TO_SIZE}: take your usual size.`;
  return null;
}

export function formatRating(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1);
}

/** Star fill per position for a rating, e.g. 3.5 → [1, 1, 1, 0.5, 0]. */
export function starFills(rating: number): number[] {
  return [1, 2, 3, 4, 5].map((position) => Math.max(0, Math.min(1, rating - (position - 1))));
}

export function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
