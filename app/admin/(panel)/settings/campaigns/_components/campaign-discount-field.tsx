"use client";

import { formatDate } from "@/utils/format-date";
import type { ProductDiscount } from "@/types/product-discount";
import { FieldLabel } from "../../_components/settings-ui";

type Props = { discounts: ProductDiscount[]; value: string; onChange: (id: string) => void };

/** Picks the offer a campaign advertises; clicking the banner opens the shop on it. */
export function CampaignDiscountField({ discounts, value, onChange }: Props) {
  const selected = value ? discounts.find((d) => d.id === value) : null;
  return (
    <div>
      <FieldLabel>Offer or discount</FieldLabel>
      <select
        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      >
        <option value="">No discount</option>
        {discounts.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      {selected && (
        <p className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
          <span>
            {selected.type === "percentage" ? `${selected.value}% off` : `${selected.value} off`} ·{" "}
            {selected.startDate ? formatDate(selected.startDate) : "now"} → {selected.endDate ? formatDate(selected.endDate) : "open-ended"}
          </span>
          <button className="cursor-pointer font-semibold text-red-600 hover:text-red-800" onClick={() => onChange("")} type="button">
            Remove
          </button>
        </p>
      )}
    </div>
  );
}
