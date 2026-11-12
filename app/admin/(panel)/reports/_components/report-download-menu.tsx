"use client";

import { useState } from "react";
import { toast } from "sonner";
import { downloadReport } from "@/lib/admin-api/platform";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { useAppSelector } from "@/lib/store/hooks";
import { selectReportRange } from "@/lib/store/slices/admin-filters-slice";
import type { ReportEndpoint } from "@/types/reports";

const FORMATS = [
  { format: "csv", label: "CSV (spreadsheet)" },
  { format: "pdf", label: "PDF" },
] as const;

/** Download the current report, for the selected range, as CSV or PDF. */
export function ReportDownloadMenu({ endpoint }: { endpoint: ReportEndpoint }) {
  const range = useAppSelector(selectReportRange);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function download(format: "csv" | "pdf") {
    setOpen(false);
    setBusy(true);
    try {
      await downloadReport(endpoint, format, { startDate: range.startDate, endDate: range.endDate });
    } catch {
      toast.error(ERROR_MESSAGES.report.downloadFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-12 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 font-black shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-60"
        disabled={busy}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <svg aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        {busy ? "Preparing…" : "Download"}
      </button>
      {open ? (
        <div className="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg" role="menu">
          {FORMATS.map(({ format, label }) => (
            <button
              className="w-full px-4 py-2 text-left font-medium text-slate-700 hover:bg-slate-50"
              key={format}
              onClick={() => download(format)}
              role="menuitem"
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
