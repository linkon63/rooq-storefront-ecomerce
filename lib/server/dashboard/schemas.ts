import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { CHART_GRANULARITIES, DASHBOARD_PERIODS } from "@/utils/dashboard/date-range";

/** ?period=&startDate=&endDate=&granularity= — DashboardQueryDto */
export const dashboardQuerySchema = z.object({
  period: z.enum(DASHBOARD_PERIODS, { error: ERROR_MESSAGES.dashboard.invalidPeriod }).default("month"),
  startDate: z.iso.date({ error: ERROR_MESSAGES.report.invalidDate }).or(z.iso.datetime()).optional(),
  endDate: z.iso.date({ error: ERROR_MESSAGES.report.invalidDate }).or(z.iso.datetime()).optional(),
  granularity: z.enum(CHART_GRANULARITIES, { error: ERROR_MESSAGES.dashboard.invalidGranularity }).default("daily"),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export type DashboardQuery = z.output<typeof dashboardQuerySchema>;
