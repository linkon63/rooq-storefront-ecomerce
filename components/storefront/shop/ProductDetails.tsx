"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiHeart, FiMinus, FiPlus, FiShoppingCart, FiTruck, FiShield, FiRefreshCw, FiZap } from "react-icons/fi";
import { toast } from "sonner";

import type { Product } from "@/lib/admin-api";
import { resolveImageUrl } from "@/lib/admin-api";
import { resolveVariantPricing } from "@/lib/shop-api";
import { buildAttributeGroups, variantValues } from "@/lib/product-variants";
import { SPECIFICATION_SECTIONS } from "@/lib/product-specifications";
import { isPhoneViewport } from "@/lib/viewport";
import BuyNowSheet from "./BuyNowSheet";
import { useCart } from "@/app/_providers/cart-provider";
import { useWishlist } from "@/app/_providers/wishlist-provider";

const money = (value: number) =>
  `৳${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ProductDetails({ product }: { product: Product }) {
  const { addItem, buyNow } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();
  const [buyingNow, setBuyingNow] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const gallery = useMemo(() => {
    const media = [...(product.media ?? [])].sort(
      (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder,
    );
    return media.map((entry) => resolveImageUrl(entry.media.url)).filter(Boolean);
  }, [product.media]);

  const attributeGroups = useMemo(() => buildAttributeGroups(product), [product]);

  // Only the spec sections the admin actually filled in are shown.
  const specSections = SPECIFICATION_SECTIONS.map((section) => ({
    ...section,
    items: product.specifications?.[section.key] ?? [],
  })).filter((section) => section.items.length > 0);

  const defaultVariant =
    product.variants?.find((variant) => variant.isDefault) ?? product.variants?.[0];

  const [selection, setSelection] = useState<Record<string, string>>(() =>
    defaultVariant ? variantValues(defaultVariant) : {},
  );
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // The variant matching every chosen attribute; falls back to the default.
  const selectedVariant =
    product.variants?.find((variant) => {
      const values = variantValues(variant);
      return attributeGroups.every((group) => values[group.name] === selection[group.name]);
    }) ?? defaultVariant;

  // The offer price is per variant, so it follows whichever variant is picked.
  const price = Number(selectedVariant?.price ?? 0);
  const { price: payable } = resolveVariantPricing(selectedVariant, product);
  const hasDiscount = payable < price;
  const inStock = (selectedVariant?.stockQuantity ?? 0) > 0;
  const wishlisted = isInWishlist(product.id);

  const cartLine = () => ({
    slug: product.slug,
    productId: product.id,
    variantId: selectedVariant?.id,
    name: product.name,
    price: payable,
    // Carried so the cart can strike the list price out without waiting for
    // its own catalogue lookup.
    originalPrice: hasDiscount ? price : undefined,
    image: gallery[0] ?? "",
    color: "",
    size: Object.values(selection).join(" / "),
    attributes: selection,
    quantity,
  });

  const onAddToCart = () => {
    if (!inStock) return;
    void addItem(cartLine());
    toast.success(`${product.name} added to cart`);
  };

  /**
   * Buy Now is Add to Cart without the detour: the line is added silently and
   * selected on its own, so checkout bills this product alone and anything
   * already in the cart is left for later. The push waits for both.
   */
  const onBuyNow = async () => {
    if (!inStock || buyingNow) return;
    // Phones confirm the variant and quantity in a bottom sheet first; it opens
    // on whatever is already picked on the page.
    if (isPhoneViewport()) {
      setSheetOpen(true);
      return;
    }
    setBuyingNow(true);
    try {
      await buyNow(cartLine());
      router.push("/checkout");
    } catch {
      // The cart provider already reports why the line could not be added.
      setBuyingNow(false);
    }
  };

  // Quantity, Add to Cart and Buy Now are rendered twice — inline on desktop and
  // in the docked bar on phones — so they are defined once here. Each copy is
  // shown at its own breakpoint, which is why both sets of sizes are present:
  // the mobile bar is tight, so it drops the icons and narrows the stepper.
  const quantityStepper = (
    <div className="flex shrink-0 items-center border border-gray-200">
      <button
        type="button"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        aria-label="Decrease quantity"
        className="flex h-11 w-9 items-center justify-center text-gray-600 hover:text-brand md:w-11"
      >
        <FiMinus size={15} />
      </button>
      <span className="w-8 text-center text-sm font-medium md:w-12">{quantity}</span>
      <button
        type="button"
        onClick={() => setQuantity((q) => q + 1)}
        aria-label="Increase quantity"
        className="flex h-11 w-9 items-center justify-center text-gray-600 hover:text-brand md:w-11"
      >
        <FiPlus size={15} />
      </button>
    </div>
  );

  const addToCartButton = (
    <button
      type="button"
      onClick={onAddToCart}
      disabled={!inStock}
      className="flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border border-brand bg-white px-3 text-[13px] font-medium text-brand transition-all duration-200 hover:bg-brand-mist disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 md:min-w-[170px] md:gap-2 md:px-6 md:text-sm"
    >
      <FiShoppingCart size={16} className="hidden md:block" />
      Add to Cart
    </button>
  );

  const buyNowButton = (
    <button
      type="button"
      onClick={onBuyNow}
      disabled={!inStock || buyingNow}
      className="flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap bg-brand px-3 text-[13px] font-medium text-white transition-all duration-200 hover:bg-brand-dark hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:shadow-none md:min-w-[170px] md:gap-2 md:px-6 md:text-sm"
    >
      <FiZap size={16} className="hidden md:block" />
      {buyingNow ? "Please wait…" : "Buy Now"}
    </button>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 pb-28 md:px-8 md:py-14">
      <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Back to wherever the shopper came from — a category, search results,
            the wishlist. Opened straight from a link or a new tab there is no
            history to step back into, so the shop is the sensible landing. */}
        <button
          type="button"
          onClick={() =>
            window.history.length > 1 ? router.back() : router.push("/shop")
          }
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand/30 bg-white px-3.5 py-1.5 text-[13px] font-medium text-brand transition-colors hover:bg-brand hover:text-white"
        >
          <FiArrowLeft size={15} />
          Back
        </button>

        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:text-brand">Home</Link>
          <span>/ </span>
          <Link href="/shop" className="hover:text-brand">Shop</Link>
          <span>/ {product.name}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* ── Gallery ───────────────────────────────────────────────────── */}
        <div>
          <div className="relative aspect-square overflow-hidden bg-gray-50">
            {gallery[activeImage] ? (
              <Image
                src={gallery[activeImage]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No image</div>
            )}
          </div>

          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                  className={`relative aspect-square overflow-hidden border transition-colors ${
                    index === activeImage ? "border-brand" : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <Image src={url} alt="" fill sizes="20vw" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Buy box ───────────────────────────────────────────────────── */}
        <div>
          {product.brand?.name && (
            <p className="text-sm uppercase tracking-wide text-brand">{product.brand.name}</p>
          )}
          <h1 className="font-display mt-2 text-3xl font-semibold text-[#1f2a17] md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="font-display text-3xl font-semibold text-[#1f2a17]">
              {money(payable)}
            </span>
            {hasDiscount && (
              <span className="font-display text-lg text-gray-400 line-through">{money(price)}</span>
            )}
            {product.unit?.name && (
              <span className="text-sm text-gray-500">per {product.unit.name.toLowerCase()}</span>
            )}
          </div>

          <p className="mt-2 text-sm">
            {inStock ? (
              <span className="text-brand">In stock — {selectedVariant?.stockQuantity} available</span>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </p>

          {/* On a phone the description pushes the size choice below the fold,
              so below md the two are swapped and the pickers follow the name
              directly. `flex-col-reverse` does it without rendering either
              block twice; desktop keeps the original order. */}
          <div className="flex flex-col-reverse md:flex-col">
            {product.description && (
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-gray-600">{product.description}</p>
            )}

            {/* Variant pickers, one row per attribute. Wrapped so the swap
                moves them as a block instead of reversing the rows. */}
            <div>
              {attributeGroups.map((group) => (
                <div key={group.name} className="mt-6">
                  <p className="mb-2 text-sm font-semibold text-[#1f2a17]">
                    {group.name}:{" "}
                    <span className="font-normal text-gray-500">{selection[group.name]}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.values.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelection((prev) => ({ ...prev, [group.name]: value }))}
                        className={`border px-4 py-2 text-sm transition-colors ${
                          selection[group.name] === value
                            ? "border-brand bg-brand text-white"
                            : "border-gray-200 text-gray-700 hover:border-brand"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity + actions. Below md the first three move to the docked bar
              at the bottom of the screen, leaving wishlist here on its own. */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="hidden md:contents">
              {quantityStepper}
              {addToCartButton}
              {buyNowButton}
            </div>

            <button
              type="button"
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: payable,
                  image: gallery[0] ?? "",
                } as Parameters<typeof toggleWishlist>[0])
              }
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`flex h-11 w-full items-center justify-center gap-2 border px-4 text-sm font-medium transition-colors md:w-11 md:px-0 ${
                wishlisted
                  ? "border-brand bg-brand text-white"
                  : "border-gray-200 text-gray-600 hover:border-brand hover:text-brand"
              }`}
            >
              <FiHeart size={17} fill={wishlisted ? "currentColor" : "none"} />
              {/* The icon alone reads as an orphan once the buttons beside it
                  have moved to the bar, so on phones it gets its label back. */}
              <span className="md:hidden">
                {wishlisted ? "Saved to wishlist" : "Add to wishlist"}
              </span>
            </button>
          </div>

          {/* Reassurance strip */}
          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-3">
            <Assurance icon={<FiTruck size={18} />} title="Free delivery" text="See the delivery Policy" />
            <Assurance icon={<FiRefreshCw size={18} />} title="Easy returns" text="Based on return policy" />
            <Assurance icon={<FiShield size={18} />} title="100% organic" text="Chemical free, certified" />
          </div>

          {product.tags?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag.id} className="bg-brand-mist px-3 py-1 text-xs text-brand">
                  {tag.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {specSections.length > 0 && (
        <section className="mt-14 border-t border-gray-100 pt-10">
          <h2 className="font-display text-2xl font-semibold text-[#1f2a17]">Product Specification</h2>
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
            {specSections.map(({ key, label, items }) => (
              <div key={key}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-brand">{label}</h3>
                <ul className="mt-3 space-y-2">
                  {items.map((item, index) => (
                    <li key={index} className="flex gap-2.5 text-sm leading-relaxed text-gray-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Docked purchase bar — on a phone the actions scroll out of reach long
          before the shopper has finished reading, so they stay pinned to the
          bottom. The safe-area inset keeps them clear of the iOS home bar. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2.5 pb-[calc(0.625rem_+_env(safe-area-inset-bottom))] shadow-[0_-2px_12px_rgba(0,0,0,0.08)] md:hidden">
        {quantityStepper}
        {addToCartButton}
        {buyNowButton}
      </div>

      {sheetOpen && (
        <BuyNowSheet
          productId={product.id}
          product={product}
          preview={{
            name: product.name,
            image: gallery[0] ?? "",
            price: payable,
            originalPrice: hasDiscount ? price : undefined,
          }}
          initialSelection={selection}
          initialQuantity={quantity}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}

function Assurance({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-brand">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-[#1f2a17]">{title}</p>
        <p className="text-xs text-gray-500">{text}</p>
      </div>
    </div>
  );
}
