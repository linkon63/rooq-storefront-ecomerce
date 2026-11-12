"use client";

import { useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { DEFAULT_SKU_PATTERN } from "@/lib/constants/catalog";
import { errorText } from "@/utils/error-text";
import { numberOrNull, numberOrUndefined } from "@/utils/catalog/form-values";
import type { AdminColor, AdminSize, MatrixPayload, MatrixPreview } from "@/types/catalog-admin";
import { Button } from "../../_catalog/button";
import { Field, TextInput } from "../../_catalog/field";
import { ChipGroup } from "../../_catalog/chip-group";
import { SizePicker } from "../../_catalog/size-picker";
import { MatrixPreviewList } from "./matrix-preview-list";

type Props = { productId: string; colors: AdminColor[]; sizes: AdminSize[]; onCreated: () => void };

/** Pick colours × sizes → preview the SKUs → create the missing variants in one go. */
export function MatrixGenerator({ productId, colors, sizes, onCreated }: Props) {
  const [colorIds, setColorIds] = useState<string[]>([]);
  const [sizeIds, setSizeIds] = useState<string[]>([]);
  const [skuPattern, setSkuPattern] = useState(DEFAULT_SKU_PATTERN);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [threshold, setThreshold] = useState("");
  const [preview, setPreview] = useState<MatrixPreview | null>(null);
  const [busy, setBusy] = useState(false);

  const payload = (): MatrixPayload => ({
    colorIds, sizeIds, skuPattern: skuPattern.trim() || undefined, price: numberOrNull(price),
    stock: numberOrUndefined(stock), lowStockThreshold: numberOrUndefined(threshold),
  });

  async function run(dryRun: boolean) {
    if (!colorIds.length || !sizeIds.length) return toast.error(ERROR_MESSAGES.variant.matrixEmpty);
    setBusy(true);
    try {
      if (dryRun) setPreview(await catalogApi.variants.preview(productId, payload()));
      else {
        const result = await catalogApi.variants.generate(productId, payload());
        toast.success(SUCCESS_MESSAGES.catalog.variantsGenerated(result.created.length));
        setPreview(null);
        setColorIds([]);
        setSizeIds([]);
        onCreated();
      }
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    } finally {
      setBusy(false);
    }
  }

  const activeColors = colors.filter((c) => c.isActive);
  return (
    <div className="grid gap-4 rounded-lg border border-slate-200 p-4">
      <ChipGroup label="Colours" options={activeColors.map((c) => ({ value: c.id, label: c.name }))} selected={colorIds} onChange={(next) => { setColorIds(next); setPreview(null); }} empty="Add colours on the Colours page first." />
      <div>
        <p className="mb-1.5 text-sm font-medium text-slate-700">Sizes</p>
        <SizePicker sizes={sizes} selected={sizeIds} onChange={(next) => { setSizeIds(next); setPreview(null); }} />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="SKU pattern" hint="{style} {color} {size}"><TextInput value={skuPattern} onChange={(e) => setSkuPattern(e.target.value)} spellCheck={false} /></Field>
        <Field label="Price override" hint="Empty = product price"><TextInput type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
        <Field label="Opening stock each"><TextInput type="number" min={0} step={1} value={stock} onChange={(e) => setStock(e.target.value)} /></Field>
        <Field label="Low-stock alert at" hint="Empty = shop default"><TextInput type="number" min={0} step={1} value={threshold} onChange={(e) => setThreshold(e.target.value)} /></Field>
      </div>
      {preview ? <MatrixPreviewList preview={preview} colors={colors} sizes={sizes} /> : null}
      <div className="flex flex-wrap justify-end gap-2">
        <span className="mr-auto self-center text-sm text-slate-500">{colorIds.length} × {sizeIds.length} = {colorIds.length * sizeIds.length} combinations</span>
        <Button tone="secondary" disabled={busy} onClick={() => run(true)}>Preview SKUs</Button>
        <Button disabled={busy || (preview !== null && !preview.planned.length)} onClick={() => run(false)}>{busy ? "Working…" : "Create variants"}</Button>
      </div>
    </div>
  );
}
