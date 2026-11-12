import { numberOrNull, textOrNull } from "./form-values";

/** Editable fields of one variant row, as raw input strings. */
export type VariantDraft = {
  sku: string; barcode: string; price: string; compareAtPrice: string; costPrice: string;
  stock: string; lowStockThreshold: string; isActive: boolean;
};

export type DraftSource = {
  id: string; sku: string; barcode: string | null; priceOverride: number | null; compareAtOverride: number | null;
  costPrice: number | null; stock: number; lowStockThreshold: number; isActive: boolean;
};

const num = (value: number | null) => (value === null ? "" : String(value));

export function variantToDraft(v: DraftSource): VariantDraft {
  return {
    sku: v.sku, barcode: v.barcode ?? "", price: num(v.priceOverride), compareAtPrice: num(v.compareAtOverride),
    costPrice: num(v.costPrice), stock: String(v.stock), lowStockThreshold: String(v.lowStockThreshold), isActive: v.isActive,
  };
}

export type VariantChange = {
  id: string; sku?: string; barcode?: string | null; price?: number | null; compareAtPrice?: number | null;
  costPrice?: number | null; stock?: number; lowStockThreshold?: number; isActive?: boolean;
};

/** Only the fields that differ from the saved variant; null when nothing changed. */
export function draftChanges(v: DraftSource, d: VariantDraft): VariantChange | null {
  const change: VariantChange = { id: v.id };
  const sku = d.sku.trim().toUpperCase();
  if (sku && sku !== v.sku) change.sku = sku;
  if (textOrNull(d.barcode) !== v.barcode) change.barcode = textOrNull(d.barcode);
  if (numberOrNull(d.price) !== v.priceOverride) change.price = numberOrNull(d.price);
  if (numberOrNull(d.compareAtPrice) !== v.compareAtOverride) change.compareAtPrice = numberOrNull(d.compareAtPrice);
  if (numberOrNull(d.costPrice) !== v.costPrice) change.costPrice = numberOrNull(d.costPrice);
  const stock = numberOrNull(d.stock);
  if (stock !== null && Number.isInteger(stock) && stock >= 0 && stock !== v.stock) change.stock = stock;
  const threshold = numberOrNull(d.lowStockThreshold);
  if (threshold !== null && Number.isInteger(threshold) && threshold >= 0 && threshold !== v.lowStockThreshold) change.lowStockThreshold = threshold;
  if (d.isActive !== v.isActive) change.isActive = d.isActive;
  return Object.keys(change).length > 1 ? change : null;
}

/** Bulk-apply one field value to the selected drafts. */
export function applyToDrafts(
  drafts: Record<string, VariantDraft>,
  ids: readonly string[],
  field: "price" | "compareAtPrice" | "stock" | "lowStockThreshold",
  value: string,
): Record<string, VariantDraft> {
  const next = { ...drafts };
  for (const id of ids) if (next[id]) next[id] = { ...next[id], [field]: value };
  return next;
}
