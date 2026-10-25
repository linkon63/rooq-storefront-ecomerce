"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiMinus, FiPlus, FiShoppingCart, FiX, FiZap } from "react-icons/fi";

import ModalPortal from "@/components/storefront/shared/modal-portal";
import { useCart } from "@/app/_providers/cart-provider";
import { resolveImageUrl, type Product } from "@/lib/admin-api";
import { buildAttributeGroups, defaultVariantOf, variantValues } from "@/lib/product-variants";
import { fetchShopProductById, resolveVariantPricing } from "@/lib/shop-api";

const money = (value: number) =>
  `৳${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/** Matches the slide/fade duration below, so the sheet unmounts once it is off screen. */
const EXIT_MS = 250;

export interface BuyNowSheetProps {
  productId: string;
  /** What the card already knows, painted while the full product loads. */
  preview: { name: string; image: string; price: number; originalPrice?: number };
  /** Pass when the caller already has it (the product page) to skip the fetch. */
  product?: Product | null;
  initialSelection?: Record<string, string>;
  initialQuantity?: number;
  onClose: () => void;
}

/**
 * Phones only: the Buy Now bottom sheet. It slides up from the bottom, lets
 * the shopper pick a variant (when the product has any) and a quantity, then
 * either adds the line to the cart or goes to checkout with it — along with
 * the rest of the cart, all ticked, for the shopper to untick what they skip.
 * Mount it to open, unmount it (via `onClose`) to close.
 */
export default function BuyNowSheet({
  productId,
  preview,
  product: preloaded,
  initialSelection,
  initialQuantity = 1,
  onClose,
}: BuyNowSheetProps) {
  const router = useRouter();
  const { addItem, buyNow } = useCart();

  const [product, setProduct] = useState<Product | null>(preloaded ?? null);
  const [loading, setLoading] = useState(!preloaded);
  const [selection, setSelection] = useState<Record<string, string>>(initialSelection ?? {});
  const [quantity, setQuantity] = useState(initialQuantity);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState<"cart" | "buy" | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Card callers only carry a summary — fetch the variants on open.
  useEffect(() => {
    if (preloaded) return;
    let cancelled = false;
    fetchShopProductById(productId).then((loaded) => {
      if (cancelled) return;
      setProduct(loaded);
      setLoading(false);
      if (loaded && !initialSelection) {
        const fallback = defaultVariantOf(loaded);
        if (fallback) setSelection(variantValues(fallback));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [productId, preloaded, initialSelection]);

  // Slide in on the frame after mount, so the transition has a start state.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const close = () => {
    setShown(false);
    closeTimer.current = setTimeout(onClose, EXIT_MS);
  };

  // Lock the page behind the sheet and let Escape dismiss it.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
    // `close` only touches state setters and the ref, so binding it once is safe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const attributeGroups = useMemo(() => (product ? buildAttributeGroups(product) : []), [product]);

  // Exact match only: a combination the catalogue does not stock must not
  // quietly fall back to some other variant.
  const variant = product
    ? attributeGroups.length === 0
      ? defaultVariantOf(product)
      : product.variants?.find((candidate) => {
          const values = variantValues(candidate);
          return attributeGroups.every((group) => values[group.name] === selection[group.name]);
        })
    : undefined;

  const pricing = variant
    ? resolveVariantPricing(variant, product ?? undefined)
    : { price: preview.price, originalPrice: preview.originalPrice };
  const image = useMemo(() => {
    const media = [...(product?.media ?? [])].sort(
      (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder,
    );
    return media[0] ? resolveImageUrl(media[0].media.url) : preview.image;
  }, [product?.media, preview.image]);

  const stock = variant?.stockQuantity ?? 0;
  const unavailable = !loading && (!product || !variant);
  const outOfStock = !loading && !!variant && stock <= 0;
  const canBuy = !loading && !!variant && stock > 0 && busy === null;

  const cartLine = () => ({
    slug: product?.slug ?? "",
    productId,
    variantId: variant?.id,
    name: product?.name ?? preview.name,
    price: pricing.price,
    originalPrice: pricing.originalPrice,
    image,
    color: "",
    size: Object.values(selection).join(" / "),
    attributes: selection,
    quantity,
  });

  const onAddToCart = async () => {
    if (!canBuy) return;
    setBusy("cart");
    try {
      await addItem(cartLine());
      close();
    } catch {
      // The cart provider already reports why the line could not be added.
      setBusy(null);
    }
  };

  const onBuyNow = async () => {
    if (!canBuy) return;
    setBusy("buy");
    try {
      // The whole cart comes along ticked; checkout lets the shopper untick lines.
      await buyNow(cartLine(), { includeCart: true });
      router.push("/checkout");
    } catch {
      setBusy(null);
    }
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label={`Buy ${preview.name}`}>
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-[250ms] ${
            shown ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-[250ms] ease-out ${
            shown ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Grab handle + close */}
          <div className="relative flex justify-center pb-2 pt-3">
            <span aria-hidden className="h-1.5 w-12 rounded-full bg-gray-200" />
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-[#1f2a17]"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="overflow-y-auto px-5 pb-4">
            {/* Summary */}
            <div className="flex gap-4 border-b border-gray-100 pb-4 pr-8">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                {image ? (
                  <Image src={image} alt={preview.name} fill sizes="80px" className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-[16px] font-semibold leading-snug text-[#1f2a17]">
                  {product?.name ?? preview.name}
                </p>
                <p className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-[18px] font-bold text-brand">{money(pricing.price)}</span>
                  {pricing.originalPrice && pricing.originalPrice > pricing.price && (
                    <span className="text-[13px] text-gray-400 line-through">
                      {money(pricing.originalPrice)}
                    </span>
                  )}
                </p>
                {!loading && (
                  <p
                    className={`mt-1 text-[12px] font-medium ${
                      canBuy || busy ? "text-brand" : "text-red-600"
                    }`}
                  >
                    {unavailable ? "This option is not available" : outOfStock ? "Out of stock" : "In stock"}
                  </p>
                )}
              </div>
            </div>

            {/* Variants */}
            {loading ? (
              <div className="space-y-3 py-4" aria-hidden>
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                <div className="flex gap-2">
                  <div className="h-10 w-20 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-10 w-20 animate-pulse rounded-full bg-gray-100" />
                </div>
              </div>
            ) : (
              attributeGroups.map((group) => (
                <fieldset key={group.name} className="border-b border-gray-100 py-4">
                  <legend className="mb-2.5 text-[14px] font-semibold text-[#1f2a17]">
                    {group.name}:{" "}
                    <span className="font-normal text-gray-500">{selection[group.name] ?? "Choose"}</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {group.values.map((value) => {
                      const active = selection[group.name] === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setSelection((prev) => ({ ...prev, [group.name]: value }))}
                          className={`h-10 min-w-[64px] rounded-full border px-4 text-[14px] font-medium transition-colors ${
                            active
                              ? "border-brand bg-brand text-white"
                              : "border-gray-200 bg-white text-[#1f2a17] hover:border-brand"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))
            )}

            {/* Quantity */}
            <div className="flex items-center justify-between py-4">
              <span className="text-[14px] font-semibold text-[#1f2a17]">Quantity</span>
              <div className="flex items-center rounded-full border border-gray-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-10 w-10 items-center justify-center text-gray-600"
                >
                  <FiMinus size={15} />
                </button>
                <span className="w-8 text-center text-[15px] font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => (stock > 0 ? Math.min(stock, q + 1) : q + 1))}
                  aria-label="Increase quantity"
                  className="flex h-10 w-10 items-center justify-center text-gray-600"
                >
                  <FiPlus size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions — the safe-area inset keeps them clear of the iOS home bar. */}
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 px-5 pb-[calc(1rem_+_env(safe-area-inset-bottom))] pt-3">
            <button
              type="button"
              onClick={onAddToCart}
              disabled={!canBuy}
              className="flex h-12 items-center justify-center gap-2 rounded-full border-2 border-brand bg-white text-[15px] font-semibold text-brand disabled:border-gray-200 disabled:text-gray-400"
            >
              <FiShoppingCart size={17} />
              {busy === "cart" ? "Adding…" : "Add to Cart"}
            </button>
            <button
              type="button"
              onClick={onBuyNow}
              disabled={!canBuy}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold text-white disabled:bg-gray-300"
            >
              <FiZap size={17} />
              {busy === "buy" ? "Please wait…" : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
