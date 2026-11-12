"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { MANUAL_MOVEMENT_TYPES, STOCK_MOVEMENT_LABELS } from "@/lib/constants/catalog";
import { errorText } from "@/utils/error-text";
import { textOrNull } from "@/utils/catalog/form-values";
import type { AdminInventoryRow } from "@/types/catalog-admin";
import { Modal } from "../../_catalog/modal";
import { Button } from "../../_catalog/button";
import { Field, SelectInput, TextInput } from "../../_catalog/field";
import { ErrorBlock } from "../../_catalog/data-states";

type Mode = "change" | "setTo";
type ManualType = (typeof MANUAL_MOVEMENT_TYPES)[number];

export function AdjustStockModal({ row, onClose, onSaved }: { row: AdminInventoryRow; onClose: () => void; onSaved: (row: AdminInventoryRow) => void }) {
  const [mode, setMode] = useState<Mode>("change");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<ManualType>("RESTOCK");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const value = Number(amount);
  const after = mode === "change" ? row.stock + (Number.isFinite(value) ? value : 0) : value;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (amount.trim() === "" || !Number.isInteger(value)) return setError(ERROR_MESSAGES.ui.requiredFields);
    if (after < 0) return setError(ERROR_MESSAGES.inventory.negativeStock);
    if (mode === "change" && value === 0) return setError(ERROR_MESSAGES.inventory.zeroChange);
    setSaving(true);
    setError(null);
    try {
      const result = await catalogApi.inventory.adjust({ variantId: row.id, ...(mode === "change" ? { change: value } : { setTo: value }), type, reason: textOrNull(reason) });
      toast.success(SUCCESS_MESSAGES.catalog.stockAdjusted);
      onSaved(result.variant);
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={`Adjust stock · ${row.sku}`}
      onClose={onClose}
      footer={
        <>
          <Button tone="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="adjust-form" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </>
      }
    >
      <form id="adjust-form" onSubmit={submit} className="grid gap-4">
        <p className="text-sm text-slate-600">{row.product.name} — {row.color.name} / {row.size.label}. Currently <strong className="tabular-nums text-slate-900">{row.stock}</strong> in stock.</p>
        {error ? <ErrorBlock message={error} /> : null}
        <div role="radiogroup" aria-label="Adjustment mode" className="inline-flex justify-self-start rounded-lg bg-slate-100 p-1 text-sm">
          {([["change", "Add / remove"], ["setTo", "Set exact count"]] as const).map(([key, label]) => (
            <button key={key} type="button" role="radio" aria-checked={mode === key} onClick={() => { setMode(key); setType(key === "setTo" ? "CORRECTION" : "RESTOCK"); }} className={`rounded-md px-3 py-1 font-semibold ${mode === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={mode === "change" ? "Change (use − to remove)" : "New stock count"} hint={Number.isFinite(after) ? `Stock after: ${after}` : undefined}>
            <TextInput type="number" step={1} min={mode === "setTo" ? 0 : undefined} value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus required />
          </Field>
          <Field label="Type">
            <SelectInput value={type} onChange={(e) => setType(e.target.value as ManualType)}>
              {MANUAL_MOVEMENT_TYPES.map((t) => <option key={t} value={t}>{STOCK_MOVEMENT_LABELS[t]}</option>)}
            </SelectInput>
          </Field>
        </div>
        <Field label="Reason" hint="Kept in the stock ledger, e.g. “Delivery from supplier”, “Damaged in store”.">
          <TextInput value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
