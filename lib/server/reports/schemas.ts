import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

export const REPORT_FORMATS = ["json", "csv", "pdf"] as const;
export type ReportFormat = (typeof REPORT_FORMATS)[number];

const isoDate = z.iso.date({ error: ERROR_MESSAGES.report.invalidDate }).or(z.iso.datetime({ offset: true }));

/** ?startDate=&endDate=&page=&limit=&format= — ReportQueryDto */
export const reportQuerySchema = z
  .object({
    startDate: isoDate.optional(),
    endDate: isoDate.optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
    format: z.enum(REPORT_FORMATS, { error: (issue) => ERROR_MESSAGES.report.unsupportedFormat(String(issue.input)) }).optional(),
  })
  .refine((query) => !query.startDate || !query.endDate || new Date(query.startDate) <= new Date(query.endDate), {
    message: ERROR_MESSAGES.report.invalidRange,
    path: ["startDate"],
  });

export type ReportQuery = z.output<typeof reportQuerySchema>;
