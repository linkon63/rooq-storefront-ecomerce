import { endOfDay } from "../dashboard/date-range";

export type ReportRange = { start: Date; end: Date };

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Report window: defaults to 1 January of this year → now. Date-only values
 * are local days; a date-only end
 * ("2026-05-31") covers that whole day, not just its first millisecond.
 */
export function resolveReportRange(startDate?: string, endDate?: string, now: Date = new Date()): ReportRange {
  let start = new Date(now.getFullYear(), 0, 1);
  if (startDate) start = DATE_ONLY.test(startDate) ? new Date(`${startDate}T00:00:00`) : new Date(startDate);
  let end = now;
  if (endDate) end = DATE_ONLY.test(endDate) ? endOfDay(new Date(`${endDate}T00:00:00`)) : new Date(endDate);
  return { start, end };
}

/** Slice an in-memory list the way the old report endpoints did. */
export function paginateList<T>(items: T[], page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  return { items: items.slice(offset, offset + limit), meta: { page, limit, total: items.length } };
}

export const round2 = (value: number) => Math.round(value * 100) / 100;
