"use client";

import { useEffect, useState } from "react";
import { getDashboardSummary, getSalesTrend, getTopProducts } from "@/lib/admin-api/platform";
import type { DashboardSummary, SalesTrendPoint, TopProduct } from "@/types/admin/dashboard";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { useAppSelector } from "@/lib/store/hooks";
import {
  selectDashboardPeriod,
  selectDashboardRange,
  selectGranularity,
} from "@/lib/store/slices/admin-filters-slice";

type DashboardData = { summary: DashboardSummary | null; trend: SalesTrendPoint[]; topProducts: TopProduct[] };

function messageOf(error: unknown): string {
  return error instanceof Error && error.message ? error.message : ERROR_MESSAGES.dashboard.loadFailed;
}

/**
 * Loads the dashboard for the window held in Redux. Summary + top products
 * reload on a window change; the trend chart also reloads on granularity.
 */
export function useDashboard() {
  const period = useAppSelector(selectDashboardPeriod);
  const range = useAppSelector(selectDashboardRange);
  const granularity = useAppSelector(selectGranularity);
  const [data, setData] = useState<DashboardData>({ summary: null, trend: [], topProducts: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isTrendLoading, setIsTrendLoading] = useState(true);
  const [error, setError] = useState("");

  const startDate = range?.startDate;
  const endDate = range?.endDate;

  useEffect(() => {
    let active = true;
    const query = { period, startDate, endDate };
    setIsLoading(true);
    setError("");
    Promise.all([getDashboardSummary(query), getTopProducts(query)])
      .then(([summary, topProducts]) => {
        if (active) setData((prev) => ({ ...prev, summary, topProducts }));
      })
      .catch((err: unknown) => active && setError(messageOf(err)))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [period, startDate, endDate]);

  useEffect(() => {
    let active = true;
    setIsTrendLoading(true);
    getSalesTrend({ period, startDate, endDate, granularity })
      .then((trend) => active && setData((prev) => ({ ...prev, trend })))
      .catch((err: unknown) => active && setError(messageOf(err)))
      .finally(() => active && setIsTrendLoading(false));
    return () => {
      active = false;
    };
  }, [period, startDate, endDate, granularity]);

  return { ...data, isLoading, isTrendLoading, error };
}
