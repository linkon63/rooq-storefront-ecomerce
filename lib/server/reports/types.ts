import type { ReportRange } from "@/utils/reports/date-range";

export type Paging = { page: number; limit: number };
export type ListMeta = { page: number; limit: number; total: number };
export type Listing<T> = { items: T[]; meta: ListMeta };
export type Period = { start: Date; end: Date };

/** A table in an exported file. `formats` limits it to CSV or PDF only. */
export type ExportTable = {
  heading?: string;
  headers: string[];
  rows: string[][];
  formats?: readonly ("csv" | "pdf")[];
};

/** Everything a CSV / PDF export needs — built once per report. */
export type ExportDocument = {
  title: string;
  filename: string;
  range: ReportRange;
  summary: [label: string, value: string][];
  tables: ExportTable[];
};
