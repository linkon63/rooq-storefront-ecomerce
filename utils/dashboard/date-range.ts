/** Reporting windows for the admin dashboard (pure; `now` is injectable for tests). */

export const DASHBOARD_PERIODS = ["today", "yesterday", "week", "month", "custom"] as const;
export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

export const CHART_GRANULARITIES = ["daily", "monthly", "yearly"] as const;
export type ChartGranularity = (typeof CHART_GRANULARITIES)[number];

export type DateRange = { start: Date; end: Date; prevStart: Date; prevEnd: Date };

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * The selected window plus the immediately preceding window of equal length
 * (used for trend percentages). Default period: the last 30 days.
 */
export function resolveDashboardRange(
  query: { period?: DashboardPeriod; startDate?: string; endDate?: string },
  now: Date = new Date(),
): DateRange {
  let start: Date;
  let end: Date;

  switch (query.period) {
    case "today":
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case "yesterday": {
      const yesterday = new Date(now.getTime() - DAY_MS);
      start = startOfDay(yesterday);
      end = endOfDay(yesterday);
      break;
    }
    case "week":
      start = startOfDay(new Date(now.getTime() - 6 * DAY_MS));
      end = endOfDay(now);
      break;
    case "custom":
      start = query.startDate
        ? startOfDay(new Date(query.startDate))
        : startOfDay(new Date(now.getTime() - 29 * DAY_MS));
      end = query.endDate ? endOfDay(new Date(query.endDate)) : endOfDay(now);
      break;
    case "month":
    default:
      start = startOfDay(new Date(now.getTime() - 29 * DAY_MS));
      end = endOfDay(now);
      break;
  }

  const span = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - span);
  return { start, end, prevStart, prevEnd };
}

/** % change of current vs previous, 1 dp; null when there is no baseline. */
export function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export type Metric = { value: number; trend: number | null };

export function metric(value: number, previous: number): Metric {
  return { value, trend: pctChange(value, previous) };
}

/** Postgres date_trunc unit for a chart granularity. */
export function truncUnit(granularity: ChartGranularity | undefined): "day" | "month" | "year" {
  if (granularity === "yearly") return "year";
  if (granularity === "monthly") return "month";
  return "day";
}
