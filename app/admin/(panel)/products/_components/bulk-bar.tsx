"use client";

import { useState } from "react";
import { Button } from "../../_catalog/button";
import { inputClass } from "../../_catalog/field";

export type BulkField = "price" | "compareAtPrice" | "stock" | "lowStockThreshold";

const FIELDS: { value: BulkField; label: string }[] = [
  { value: "price", label: "Price" },
  { value: "compareAtPrice", label: "Compare-at price" },
  { value: "stock", label: "Stock" },
  { value: "lowStockThreshold", label: "Low-stock alert" },
];

/** "Set <field> to <value> for the N selected variants" — edits the drafts; Save writes them. */
export function BulkBar({ count, onApply, onToggleActive }: { count: number; onApply: (field: BulkField, value: string) => void; onToggleActive: (active: boolean) => void }) {
  const [field, setField] = useState<BulkField>("price");
  const [value, setValue] = useState("");
  if (!count) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">
      <span className="font-semibold">{count} selected</span>
      <span>Set</span>
      <select aria-label="Field to set" className={`${inputClass} h-8 w-44`} value={field} onChange={(e) => setField(e.target.value as BulkField)}>
        {FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
      </select>
      <span>to</span>
      <input aria-label="Value" className={`${inputClass} h-8 w-28`} inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} placeholder="empty = clear" />
      <Button tone="secondary" className="h-8" onClick={() => onApply(field, value)}>Apply</Button>
      <span className="mx-1 h-5 w-px bg-blue-200" />
      <Button tone="ghost" className="h-8" onClick={() => onToggleActive(true)}>Put on sale</Button>
      <Button tone="ghost" className="h-8" onClick={() => onToggleActive(false)}>Take off sale</Button>
    </div>
  );
}
