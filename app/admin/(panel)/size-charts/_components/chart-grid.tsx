"use client";

import type { AdminSize } from "@/types/catalog-admin";
import { renameColumn, type ChartFormState } from "@/utils/catalog/size-chart-form";
import { AdminIcon } from "../../../_components/admin-icons";
import { Button, IconButton } from "../../_catalog/button";
import { inputClass } from "../../_catalog/field";

type Props = { state: ChartFormState; sizes: Map<string, AdminSize>; onChange: (state: ChartFormState) => void };

/** Rows = chosen sizes, columns = measurement names; every cell is in centimetres. */
export function ChartGrid({ state, sizes, onChange }: Props) {
  const setCell = (sizeId: string, column: string, value: string) =>
    onChange({ ...state, values: { ...state.values, [sizeId]: { ...state.values[sizeId], [column]: value } } });

  if (!state.sizeIds.length) return <p className="text-sm text-slate-500">Pick the sizes this chart covers first.</p>;

  return (
    <div className="grid gap-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr>
              <th scope="col" className="w-20 px-2 py-2 text-left font-semibold text-slate-700">Size</th>
              {state.columns.map((column, index) => (
                <th key={index} scope="col" className="px-2 py-2">
                  <span className="flex items-center gap-1">
                    <input aria-label={`Column ${index + 1} name`} className={`${inputClass} h-9 font-semibold`} value={column} onChange={(e) => onChange(renameColumn(state, index, e.target.value))} />
                    <IconButton label={`Remove column ${column || index + 1}`} onClick={() => onChange({ ...state, columns: state.columns.filter((_, i) => i !== index) })}>
                      <AdminIcon className="h-4 w-4" name="x" />
                    </IconButton>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.sizeIds.map((sizeId) => (
              <tr key={sizeId} className="border-t border-slate-100">
                <th scope="row" className="px-2 py-1.5 text-left font-semibold text-slate-900">{sizes.get(sizeId)?.label ?? "?"}</th>
                {state.columns.map((column, index) => (
                  <td key={index} className="px-2 py-1.5">
                    <input
                      aria-label={`${sizes.get(sizeId)?.label ?? ""} ${column} in cm`}
                      inputMode="decimal"
                      className={`${inputClass} h-9 tabular-nums`}
                      value={state.values[sizeId]?.[column] ?? ""}
                      onChange={(e) => setCell(sizeId, column, e.target.value)}
                      placeholder="cm"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button tone="secondary" className="h-8 justify-self-start" onClick={() => onChange({ ...state, columns: [...state.columns, ""] })}>
        <AdminIcon className="h-4 w-4" name="plus" />Add measurement
      </Button>
    </div>
  );
}
