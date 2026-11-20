"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiCheck, FiShoppingBag, FiZap } from "react-icons/fi";
import { useCart } from "@/hooks/use-cart";
import { getProduct } from "@/lib/shop-api";
import { useAppDispatch } from "@/lib/store/hooks";
import { openQuickView } from "@/lib/store/slices/ui-slice";
import type { ColorRef, ProductCard as ProductCardData } from "@/types/storefront/catalog";
import type { CartLineInput } from "@/types/storefront/commerce";

type CardActionsProps = {
  product: ProductCardData;
  activeColor?: ColorRef | null;
};

/**
 * Top-right action stack over a product card image:
 * 1. Add to bag (hovering makes Tulo happy; clicking adds to bag and makes Tulo dance)
 * 2. Buy now (adds to bag and goes straight to checkout)
 */
export function CardActions({ product, activeColor = null }: CardActionsProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { add } = useCart();
  const [busy, setBusy] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = !product.inStock;

  async function resolveInput(): Promise<CartLineInput | null> {
    const color =
      (activeColor ? product.colors.find((c) => c.id === activeColor.id) : null) ??
      product.colors[0] ??
      null;
    const size = product.sizes.find((s) => s.inStock) ?? product.sizes[0] ?? null;

    let variantId = product.defaultVariantId;
    if (!variantId) {
      try {
        const detail = await getProduct(product.id);
        const picked =
          detail.variants.find((v) => v.id === detail.defaultVariantId && v.inStock) ??
          detail.variants.find((v) => v.inStock) ??
          detail.variants[0] ??
          null;
        variantId = picked?.id ?? null;
      } catch {
        variantId = product.id;
      }
    }
    if (!variantId) return null;

    return {
      variantId,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: color?.image?.url ?? product.image?.url ?? null,
      sku: product.slug,
      colorName: color?.name ?? null,
      colorHex: color?.hex ?? null,
      sizeLabel: size?.label ?? null,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      inStock: product.inStock,
      lowStockCount: product.lowStockCount,
      quantity: 1,
    };
  }

  async function handleCart(goToCheckout: boolean) {
    if (soldOut || busy) return;
    setBusy(true);
    try {
      const input = await resolveInput();
      if (!input) {
        dispatch(openQuickView(product.id));
        return;
      }
      const ok = await add(input, { openDrawer: false });
      if (!ok) return;
      if (goToCheckout) {
        router.push("/checkout");
      } else {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1400);
      }
    } finally {
      setBusy(false);
    }
  }

  const iconBtn =
    "grid size-9 place-items-center rounded-full shadow-xs backdrop-blur-xs transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-45 md:size-10";

  return (
    <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1.5">
      <button
        type="button"
        data-panda-add-to-bag=""
        disabled={soldOut || busy}
        onClick={() => void handleCart(false)}
        title={soldOut ? "Sold out" : "Add to bag"}
        aria-label={`Add ${product.name} to bag`}
        className={`${iconBtn} ${
          justAdded
            ? "bg-ink text-chalk"
            : "bg-paper/90 text-ink hover:scale-105 hover:bg-ink hover:text-chalk"
        }`}
      >
        {justAdded ? (
          <FiCheck aria-hidden className="size-4" />
        ) : (
          <FiShoppingBag aria-hidden className="size-4" />
        )}
      </button>

      <button
        type="button"
        data-panda-buy-now=""
        disabled={soldOut || busy}
        onClick={() => void handleCart(true)}
        title={soldOut ? "Sold out" : "Buy now"}
        aria-label={`Buy ${product.name} now`}
        className={`${iconBtn} bg-dye text-chalk hover:scale-105 hover:bg-dye-deep`}
      >
        <FiZap aria-hidden className="size-4" />
      </button>
    </div>
  );
}
