"use client";

import { useState } from "react";
import type { SizeChart } from "@/types/storefront/catalog";
import { convertMeasurement, type MeasurementUnit } from "@/utils/catalog/size-chart";

/** Measurement table with a cm / in toggle. Values are stored in cm. */
export function SizeChartTable({ chart, highlightSizeId }: { chart: SizeChart; highlightSizeId?: string | null }) {
  const [unit, setUnit] = useState<MeasurementUnit>("cm");
  const rows = [...chart.rows].sort((a, b) => a.position - b.position);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-stone">Body measurements, in {unit === "cm" ? "centimetres" : "inches"}.</p>
        <div role="radiogroup" aria-label="Unit" className="inline-flex rounded border border-line p-0.5">
          {(["cm", "in"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={unit === value}
              onClick={() => setUnit(value)}
              className={`h-8 min-w-12 rounded-sm px-3 text-sm font-medium ${unit === value ? "bg-ink text-chalk" : "text-ink hover:bg-chalk"}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[28rem] border-collapse text-left text-sm tabular-nums">
          <caption className="sr-only">{chart.name} size chart</caption>
          <thead>
            <tr className="border-b border-ink">
              <th scope="col" className="py-2 pr-4 font-semibold">
                Size
              </th>
              {chart.columns.map((column) => (
                <th key={column} scope="col" className="py-2 pr-4 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sizeId} className={`border-b border-selvedge ${row.sizeId === highlightSizeId ? "bg-selvedge/60" : ""}`}>
                <th scope="row" className="py-2.5 pr-4 font-semibold">
                  {row.sizeLabel}
                </th>
                {chart.columns.map((column) => {
                  const value = row.values[column];
                  return (
                    <td key={column} className="py-2.5 pr-4">
                      {value === undefined ? "–" : convertMeasurement(value, unit)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
