"use client";

import { useCart } from "@/hooks/use-cart";
import type { CartLineInput } from "@/types/storefront/commerce";
import { useProductSelection } from "./selection-context";

/**
 * Add-to-bag behaviour shared by the main button, the sticky bar and quick
 * view. A missing size marks the attempt (the size picker shows its prompt)
 * instead of failing silently.
 */
export function useAddToBag(image: string | null) {
  const { actions, meta } = useProductSelection();
  const { add, pending } = useCart();
  const { product, variant, color, problem } = meta;
  const soldOut = problem === "soldOut";
  const label = soldOut ? "Sold out in this size" : problem === "size" ? "Choose a size" : "Add to bag";

  async function addToBag() {
    if (problem === "size" || problem === "color") {
      actions.flagAttempt();
      return false;
    }
    if (!variant || soldOut) return false;
    const size = product.sizes.find((entry) => entry.id === variant.sizeId);
    const input: CartLineInput = {
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      sku: variant.sku,
      colorName: color?.name ?? null,
      colorHex: color?.hex ?? null,
      sizeLabel: size?.label ?? null,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      inStock: variant.inStock,
      lowStockCount: variant.lowStockCount,
      quantity: 1,
    };
    return add(input);
  }

  return { addToBag, label, soldOut, pending, colorMissing: problem === "color" };
}
