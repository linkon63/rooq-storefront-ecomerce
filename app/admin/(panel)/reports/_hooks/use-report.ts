"use client";

import { useEffect, useState } from "react";
import { getReport } from "@/lib/admin-api/platform";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { useAppSelector } from "@/lib/store/hooks";
import { selectReportRange } from "@/lib/store/slices/admin-filters-slice";
import type { ReportEndpoint } from "@/types/reports";

type ReportState<T> = { data: T | null; isLoading: boolean; error: string };

/**
 * Loads one report for the shared (Redux) date range. Changing the range
 * resets to page 1; stale responses are ignored.
 */
export function useReport<T>(endpoint: ReportEndpoint, limit = 20) {
  const range = useAppSelector(selectReportRange);
  const [page, setPage] = useState(1);
  const [state, setState] = useState<ReportState<T>>({ data: null, isLoading: true, error: "" });
  const rangeKey = `${range.startDate}|${range.endDate}`;
  const [lastRangeKey, setLastRangeKey] = useState(rangeKey);

  // Derive the reset during render instead of in an effect.
  if (rangeKey !== lastRangeKey) {
    setLastRangeKey(rangeKey);
    setPage(1);
  }

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, isLoading: true, error: "" }));
    getReport<T>(endpoint, { startDate: range.startDate, endDate: range.endDate, page, limit })
      .then((data) => {
        if (active) setState({ data, isLoading: false, error: "" });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error && error.message ? error.message : ERROR_MESSAGES.report.loadFailed;
        setState((prev) => ({ ...prev, isLoading: false, error: message }));
      });
    return () => {
      active = false;
    };
  }, [endpoint, range.startDate, range.endDate, page, limit]);

  return { ...state, page, setPage };
}
