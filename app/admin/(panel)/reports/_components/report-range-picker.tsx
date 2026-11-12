"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectReportRange, setReportRange } from "@/lib/store/slices/admin-filters-slice";
import { DateRangeField } from "./date-range-field";

/** The report date range — kept in Redux so it follows you across report pages. */
export function ReportRangePicker() {
  const range = useAppSelector(selectReportRange);
  const dispatch = useAppDispatch();
  return <DateRangeField isActive={false} onChange={(next) => dispatch(setReportRange(next))} value={range} />;
}
