import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ChartGranularity, DashboardPeriod } from "@/types/dashboard";
import { yearRange } from "@/utils/dashboard/format";

/** ISO day range ("2026-01-01") — strings keep the store serialisable. */
export type DayRange = { startDate: string; endDate: string };

/**
 * Admin filter choices that should survive navigation: the dashboard window
 * and the date range shared by every report page.
 */
export type AdminFiltersState = {
  dashboardPeriod: DashboardPeriod;
  dashboardRange: DayRange | null;
  granularity: ChartGranularity;
  reportRange: DayRange;
};

export const initialAdminFiltersState: AdminFiltersState = {
  dashboardPeriod: "month",
  dashboardRange: null,
  granularity: "daily",
  reportRange: yearRange(new Date().getFullYear()),
};

export const adminFiltersSlice = createSlice({
  name: "adminFilters",
  initialState: initialAdminFiltersState,
  reducers: {
    setDashboardPeriod(state, action: PayloadAction<Exclude<DashboardPeriod, "custom">>) {
      state.dashboardPeriod = action.payload;
      state.dashboardRange = null;
    },
    setDashboardRange(state, action: PayloadAction<DayRange | null>) {
      state.dashboardRange = action.payload;
      state.dashboardPeriod = action.payload ? "custom" : "month";
    },
    setGranularity(state, action: PayloadAction<ChartGranularity>) {
      state.granularity = action.payload;
    },
    setReportRange(state, action: PayloadAction<DayRange | null>) {
      state.reportRange = action.payload ?? yearRange(new Date().getFullYear());
    },
  },
  selectors: {
    selectDashboardPeriod: (state) => state.dashboardPeriod,
    selectDashboardRange: (state) => state.dashboardRange,
    selectGranularity: (state) => state.granularity,
    selectReportRange: (state) => state.reportRange,
  },
});

export const { setDashboardPeriod, setDashboardRange, setGranularity, setReportRange } = adminFiltersSlice.actions;
export const { selectDashboardPeriod, selectDashboardRange, selectGranularity, selectReportRange } =
  adminFiltersSlice.selectors;
