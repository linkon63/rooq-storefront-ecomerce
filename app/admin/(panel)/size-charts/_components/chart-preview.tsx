"use client";

import { useState } from "react";
import { convertMeasurement, type MeasurementUnit } from "@/utils/catalog/size-chart";
import type { AdminSize } from "@/types/catalog-admin";
import { formStateToRows, type ChartFormState } from "@/utils/catalog/size-chart-form";

/** What shoppers see in the size-guide modal, with the cm / in toggle. */
export function ChartPreview({ state, sizes }: { state: ChartFormState; sizes: Map<string, AdminSize> }) {
  const [unit, setUnit] = useState<MeasurementUnit>("cm");
  const rows = formStateToRows(state);
  const columns = state.columns.map((c) => c.trim()).filter(Boolean);
  if (!rows.length || !columns.length) return null;

  return (
    <div className="grid gap-3">
      <div role="radiogroup" aria-label="Units" className="inline-flex justify-self-start rounded-lg bg-slate-100 p-1 text-sm">
        {(["cm", "in"] as const).map((option) => (
          <button key={option} type="button" role="radio" aria-checked={unit === option} onClick={() => setUnit(option)} className={`rounded-md px-3 py-1 font-semibold ${unit === option ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
            {option}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">Size</th>
              {columns.map((column) => <th key={column} scope="col" className="px-3 py-2 text-left">{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sizeId} className="border-t border-slate-100">
                <th scope="row" className="px-3 py-2 text-left">{sizes.get(row.sizeId)?.label}</th>
                {columns.map((column) => {
                  const cell = row.measurements.find((m) => m.label === column);
                  return <td key={column} className="px-3 py-2">{cell ? convertMeasurement(cell.valueCm, unit) : "—"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
