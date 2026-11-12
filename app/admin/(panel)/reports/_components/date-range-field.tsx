"use client";

import Datepicker, { type DateValueType } from "react-tailwindcss-datepicker";
import type { DayRange } from "@/lib/store/slices/admin-filters-slice";
import { isoDay } from "@/utils/dashboard/format";

function toPickerValue(range: DayRange | null): DateValueType {
  if (!range) return null;
  return { startDate: new Date(`${range.startDate}T00:00:00`), endDate: new Date(`${range.endDate}T00:00:00`) };
}

/** Date-range input shared by the dashboard and every report page. */
export function DateRangeField({
  value,
  onChange,
  isActive = true,
}: {
  value: DayRange | null;
  onChange: (range: DayRange | null) => void;
  isActive?: boolean;
}) {
  return (
    <div className="w-full sm:w-72">
      <Datepicker
        containerClassName={`relative rounded-lg border text-sm font-black shadow-sm ${isActive ? "border-blue-600" : "border-slate-300"}`}
        displayFormat="MMM DD, YYYY"
        inputClassName="w-full rounded-lg bg-transparent px-4 py-3 font-black text-slate-600 placeholder:text-slate-400 focus:outline-none"
        inputName="date-range"
        maxDate={new Date()}
        onChange={(next) => {
          if (next?.startDate && next?.endDate) {
            onChange({ startDate: isoDay(new Date(next.startDate)), endDate: isoDay(new Date(next.endDate)) });
          } else {
            onChange(null);
          }
        }}
        placeholder="Select date range"
        popoverDirection="down"
        primaryColor="blue"
        separator="→"
        showFooter
        showShortcuts
        useRange
        value={toPickerValue(value)}
        /* The library's open state uses `opacity-1`, which Tailwind v4 reads as 1%. */
        popupClassName={(defaults) => `${defaults ?? ""} opacity-100!`}
      />
    </div>
  );
}
