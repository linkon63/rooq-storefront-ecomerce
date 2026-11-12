"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { errorText } from "@/utils/error-text";
import { applyToDrafts, draftChanges, variantToDraft, type VariantDraft } from "@/utils/catalog/variant-drafts";
import type { AdminColor, AdminSize, AdminVariant } from "@/types/catalog-admin";
import { AdminIcon } from "../../../_components/admin-icons";
import { Button } from "../../_catalog/button";
import { Panel } from "../../_catalog/field";
import { DataTable } from "../../_catalog/table";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../../_catalog/data-states";
import { useAsyncData } from "../../_catalog/use-async-data";
import { MatrixGenerator } from "./matrix-generator";
import { VariantRow } from "./variant-row";
import { BulkBar } from "./bulk-bar";

const draftsFor = (variants: AdminVariant[]) => Object.fromEntries(variants.map((v) => [v.id, variantToDraft(v)]));

export function VariantsPanel({ productId, colors, sizes }: { productId: string; colors: AdminColor[]; sizes: AdminSize[] }) {
  const [drafts, setDrafts] = useState<Record<string, VariantDraft>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const variants = useAsyncData(async () => {
    const list = await catalogApi.variants.list(productId);
    setDrafts(draftsFor(list));
    setSelected([]);
    return list;
  }, `variants:${productId}`);
  const [showMatrix, setShowMatrix] = useState(false);
  const [saving, setSaving] = useState(false);
  const list = useMemo(() => variants.data ?? [], [variants.data]);
  const changes = useMemo(() => list.flatMap((v) => (drafts[v.id] ? (draftChanges(v, drafts[v.id]) ?? []) : [])), [list, drafts]);
  const dirty = new Set(changes.map((c) => c.id));

  async function save() {
    if (!changes.length) return;
    setSaving(true);
    try {
      const { updated } = await catalogApi.variants.bulk(changes);
      toast.success(SUCCESS_MESSAGES.catalog.variantsUpdated(updated));
      await variants.reload();
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    } finally {
      setSaving(false);
    }
  }

  async function remove(variant: AdminVariant) {
    try {
      const result = await catalogApi.variants.remove(variant.id);
      toast.success(result.message);
      await variants.reload();
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
    }
  }

  const allSelected = list.length > 0 && selected.length === list.length;
  return (
    <Panel
      title="Sizes & colours"
      description="One row per sellable SKU. Empty price fields use the product price. Stock edits are logged as adjustments."
      action={<Button tone="secondary" onClick={() => setShowMatrix((v) => !v)}><AdminIcon className="h-4 w-4" name="variants" />{showMatrix ? "Hide generator" : "Generate variants"}</Button>}
    >
      <div className="grid gap-4">
        {showMatrix || (!variants.loading && !list.length) ? <MatrixGenerator productId={productId} colors={colors} sizes={sizes} onCreated={() => { setShowMatrix(false); void variants.reload(); }} /> : null}
        {variants.loading && !variants.data ? <LoadingBlock label="Loading variants" /> : null}
        {variants.error ? <ErrorBlock message={variants.error} onRetry={variants.reload} /> : null}
        {variants.data && !list.length ? <EmptyBlock title="No variants yet" body="Pick colours and sizes above to create every combination at once." /> : null}
        {list.length ? (
          <>
            <BulkBar
              count={selected.length}
              onApply={(field, value) => setDrafts((d) => applyToDrafts(d, selected, field, value))}
              onToggleActive={(isActive) => setDrafts((d) => Object.fromEntries(Object.entries(d).map(([id, draft]) => [id, selected.includes(id) ? { ...draft, isActive } : draft])))}
            />
            <div className="rounded-lg border border-slate-200">
              <DataTable headings={["", "Variant", "SKU", "Barcode", "Price", "Compare-at", "Stock", "Alert at", "On sale", ""]} minWidth={1040}>
                <tr className="bg-slate-50/60">
                  <td className="px-3 py-1.5" colSpan={10}>
                    <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                      <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={allSelected} onChange={(e) => setSelected(e.target.checked ? list.map((v) => v.id) : [])} />Select all
                    </label>
                  </td>
                </tr>
                {list.map((variant) => (
                  <VariantRow
                    key={variant.id}
                    variant={variant}
                    draft={drafts[variant.id] ?? variantToDraft(variant)}
                    selected={selected.includes(variant.id)}
                    dirty={dirty.has(variant.id)}
                    onSelect={(on) => setSelected((s) => (on ? [...s, variant.id] : s.filter((id) => id !== variant.id)))}
                    onChange={(patch) => setDrafts((d) => ({ ...d, [variant.id]: { ...(d[variant.id] ?? variantToDraft(variant)), ...patch } }))}
                    onDelete={() => remove(variant)}
                  />
                ))}
              </DataTable>
            </div>
            <div className="flex items-center justify-end gap-2">
              {changes.length ? <span className="mr-auto text-sm text-amber-800">{changes.length} unsaved row{changes.length === 1 ? "" : "s"}</span> : null}
              <Button tone="secondary" disabled={!changes.length || saving} onClick={() => setDrafts(draftsFor(list))}>Discard</Button>
              <Button disabled={!changes.length || saving} onClick={save}>{saving ? "Saving…" : "Save variants"}</Button>
            </div>
          </>
        ) : null}
      </div>
    </Panel>
  );
}
