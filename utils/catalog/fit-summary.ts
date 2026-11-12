import type { FitFeedback } from "@/lib/generated/prisma/enums";

export type FitSummary = { RUNS_SMALL: number; TRUE_TO_SIZE: number; RUNS_LARGE: number; total: number; verdict: FitFeedback | null };

/** Counts per fit answer → summary; the verdict is the most common answer (ties → true to size). */
export function buildFitSummary(counts: readonly { fitFeedback: FitFeedback | null; count: number }[]): FitSummary {
  const summary: FitSummary = { RUNS_SMALL: 0, TRUE_TO_SIZE: 0, RUNS_LARGE: 0, total: 0, verdict: null };
  for (const { fitFeedback, count } of counts) {
    if (!fitFeedback) continue;
    summary[fitFeedback] += count;
    summary.total += count;
  }
  if (summary.total === 0) return summary;
  const order: FitFeedback[] = ["TRUE_TO_SIZE", "RUNS_SMALL", "RUNS_LARGE"];
  summary.verdict = order.reduce((best, key) => (summary[key] > summary[best] ? key : best), order[0]);
  return summary;
}
