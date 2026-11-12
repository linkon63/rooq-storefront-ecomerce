"use client";

import { useEffect, useState } from "react";
import { getProduct } from "@/lib/shop-api";
import type { ProductDetail } from "@/types/storefront/catalog";

type Props = { productId: string; value: string | null; onChange: (variantId: string) => void };

/** In-stock colour and size options of the same product, for an exchange. */
export function ExchangeVariantSelect({ productId, value, onChange }: Props) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getProduct(productId, controller.signal)
      .then(setProduct)
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [productId]);

  if (failed) return null;
  const colorName = (id: string) => product?.colors.find((color) => color.id === id)?.name ?? "";
  const sizeLabel = (id: string) => product?.sizes.find((size) => size.id === id)?.label ?? "";
  const options = (product?.variants ?? []).filter((variant) => variant.inStock);

  return (
    <label className="flex flex-col gap-1 text-xs text-stone">
      Exchange for
      <select
        value={value ?? ""}
        disabled={!product}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded border border-line bg-paper px-2 text-sm text-ink"
      >
        <option value="" disabled>
          {product ? "Choose colour and size" : "Loading sizes…"}
        </option>
        {options.map((variant) => (
          <option key={variant.id} value={variant.id}>
            {colorName(variant.colorId)}, size {sizeLabel(variant.sizeId)}
          </option>
        ))}
      </select>
    </label>
  );
}
