import "server-only";
import { toCsv } from "@/utils/csv";
import { resolveReportRange, type ReportRange } from "@/utils/reports/date-range";
import { renderPdf } from "./pdf";
import type { ReportQuery } from "./schemas";
import type { ExportDocument, Paging } from "./types";

export function rangeOf(query: ReportQuery): ReportRange {
  return resolveReportRange(query.startDate, query.endDate);
}

export function pagingOf(query: ReportQuery): Paging {
  return { page: query.page ?? 1, limit: query.limit ?? 20 };
}

function renderCsv(report: ExportDocument): string {
  return report.tables
    .filter((table) => !table.formats || table.formats.includes("csv"))
    .map((table) => (table.heading ? `${table.heading}\n${toCsv(table.headers, table.rows)}` : toCsv(table.headers, table.rows)))
    .join("\n");
}

const attachment = (filename: string) => `attachment; filename="${filename}"`;

/**
 * The old controllers' `?format=` switch: json → the report, csv / pdf → a
 * file download built from the report's ExportDocument.
 */
export async function reportResponse<T>(
  query: ReportQuery,
  json: (range: ReportRange, paging: Paging) => Promise<T>,
  exportDoc: (range: ReportRange) => Promise<ExportDocument>,
): Promise<Response | T> {
  const range = rangeOf(query);
  if (query.format === "csv") {
    const report = await exportDoc(range);
    // BOM so Excel opens UTF-8 (৳, names) correctly.
    return new Response(`﻿${renderCsv(report)}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": attachment(`${report.filename}.csv`),
        "Cache-Control": "no-store",
      },
    });
  }
  if (query.format === "pdf") {
    const report = await exportDoc(range);
    const pdf = await renderPdf(report);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": attachment(`${report.filename}.pdf`),
        "Cache-Control": "no-store",
      },
    });
  }
  return json(range, pagingOf(query));
}
