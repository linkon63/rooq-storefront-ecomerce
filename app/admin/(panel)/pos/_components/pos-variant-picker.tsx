"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/utils/admin/format";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { PosLine } from "@/lib/store/slices/pos-slice";
import type { ProductCard } from "@/utils/mappers/product-card";
import { AdminIcon } from "../../../_components/admin-shell";
import { usePosVariants } from "../_hooks/use-pos-variants";

type Props = { product: ProductCard; symbol: string; onClose: () => void; onAdd: (line: Omit<PosLine, "quantity">) => void };

/** Colour first, then size; sizes with no stock in that colour are disabled. */
export function PosVariantPicker({ product, symbol, onClose, onAdd }: Props) {
  const { variants, isLoading, error } = usePosVariants(product.id);
  const colors = useMemo(() => [...new Map(variants.map((v) => [v.colorId, v.color])).values()], [variants]);
  const [colorId, setColorId] = useState<string | null>(null);
  const activeColor = colorId ?? colors[0]?.id ?? null;
  const sizes = variants.filter((v) => v.colorId === activeColor).sort((a, b) => a.size.sortOrder - b.size.sortOrder);
  const [variantId, setVariantId] = useState<string | null>(null);
  const chosen = sizes.find((v) => v.id === variantId) ?? null;

  return (
    <div aria-labelledby="pos-picker-title" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center overscroll-contain bg-slate-950/50 px-4" role="dialog">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-800" id="pos-picker-title">
            {product.name}
          </h2>
          <button aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300" onClick={onClose} type="button">
            <AdminIcon className="h-4 w-4" name="x" />
          </button>
        </div>
        {error ? <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        {isLoading ? <div className="h-32 animate-pulse rounded-lg bg-slate-100" /> : null}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Colour</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              aria-pressed={color.id === activeColor}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${color.id === activeColor ? "border-slate-900" : "border-slate-200"}`}
              key={color.id}
              onClick={() => {
                setColorId(color.id);
                setVariantId(null);
              }}
              type="button"
            >
              <span aria-hidden className="h-4 w-4 rounded-full border border-slate-200" style={{ backgroundColor: color.hex }} />
              {color.name}
            </button>
          ))}
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Size</p>
        <div className="mb-6 flex flex-wrap gap-2">
          {sizes.map((variant) => (
            <button
              aria-pressed={variant.id === variantId}
              className={`min-w-12 rounded-lg border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:text-slate-300 disabled:line-through ${
                variant.id === variantId ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200"
              }`}
              disabled={variant.stock <= 0}
              key={variant.id}
              onClick={() => setVariantId(variant.id)}
              title={`${variant.stock} in stock`}
              type="button"
            >
              {variant.size.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            {chosen ? `${formatMoney(chosen.price, symbol)} · ${chosen.stock} in stock · ${chosen.sku}` : ERROR_MESSAGES.pos.variantRequired}
          </p>
          <button
            className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white disabled:bg-slate-300"
            disabled={!chosen}
            onClick={() => {
              if (!chosen) return;
              onAdd({
                variantId: chosen.id,
                productId: product.id,
                productName: product.name,
                sku: chosen.sku,
                colorName: chosen.color.name,
                colorHex: chosen.color.hex,
                sizeLabel: chosen.size.label,
                unitPrice: chosen.price,
                stock: chosen.stock,
                image: product.colors.find((c) => c.id === chosen.colorId)?.image?.url ?? product.image?.url ?? null,
              });
            }}
            type="button"
          >
            Add to sale
          </button>
        </div>
      </div>
    </div>
  );
}
