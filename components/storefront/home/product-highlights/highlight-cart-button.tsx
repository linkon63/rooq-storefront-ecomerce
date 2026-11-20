"use client";

import { useRouter } from "next/navigation";
import { FiShoppingBag, FiZap } from "react-icons/fi";
import { useCart } from "@/hooks/use-cart";
import type { ProductCard, ProductDetail } from "@/types/storefront/catalog";
import type { CartLineInput } from "@/types/storefront/commerce";

export function resolveSpotlightCartInput(
  card: ProductCard,
  detail: ProductDetail | null,
): { input: CartLineInput | null; soldOut: boolean } {
  const variant =
    detail?.variants.find((v) => v.id === detail.defaultVariantId && v.inStock) ??
    detail?.variants.find((v) => v.inStock) ??
    detail?.variants[0] ??
    null;

  if (!variant) return { input: null, soldOut: false };
  const soldOut = !variant.inStock;
  const color = detail?.colors.find((c) => c.id === variant.colorId) ?? detail?.colors[0];
  const size = detail?.sizes.find((s) => s.id === variant.sizeId);

  return {
    soldOut,
    input: {
      variantId: variant.id,
      productId: card.id,
      slug: card.slug,
      name: card.name,
      image: card.image?.url ?? color?.images[0]?.url ?? null,
      sku: variant.sku,
      colorName: color?.name ?? null,
      colorHex: color?.hex ?? null,
      sizeLabel: size?.label ?? null,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      inStock: variant.inStock,
      lowStockCount: variant.lowStockCount,
      quantity: 1,
    },
  };
}

type HighlightCartButtonProps = {
  card: ProductCard;
  detail: ProductDetail | null;
};

/**
 * Direct Add to bag (with attention-drawing ping) + Buy now actions on spotlight cards.
 */
export function HighlightCartButton({ card, detail }: HighlightCartButtonProps) {
  const router = useRouter();
  const { add, pending } = useCart();
  const { input, soldOut } = resolveSpotlightCartInput(card, detail);

  if (!input) return null;

  async function handleAdd(goToCheckout: boolean) {
    if (!input || soldOut) return;
    const ok = await add(input, { openDrawer: !goToCheckout });
    if (ok && goToCheckout) router.push("/checkout");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleAdd(false)}
        disabled={pending || soldOut}
        className={`type-label relative inline-flex h-11 items-center gap-2.5 px-5 transition-colors duration-300 ${
          soldOut
            ? "cursor-not-allowed bg-selvedge text-stone"
            : "bg-dye text-chalk shadow-sm hover:bg-dye-deep"
        }`}
      >
        {!soldOut ? (
          <span aria-hidden className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-85 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-selvedge" />
          </span>
        ) : null}
        <FiShoppingBag aria-hidden className="size-4" />
        <span>{soldOut ? "Sold out" : pending ? "Adding…" : "Add to bag"}</span>
      </button>

      {!soldOut ? (
        <button
          type="button"
          onClick={() => void handleAdd(true)}
          disabled={pending}
          className="type-label inline-flex h-11 items-center gap-2 border border-dye bg-paper px-5 text-dye transition-colors duration-300 hover:bg-dye hover:text-chalk disabled:opacity-50"
        >
          <FiZap aria-hidden className="size-3.5" />
          <span>Buy now</span>
        </button>
      ) : null}
    </>
  );
}
