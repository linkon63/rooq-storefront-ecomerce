"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiHeart, FiMinus, FiPlus, FiShoppingCart, FiTruck, FiShield, FiRefreshCw, FiZap } from "react-icons/fi";
import { toast } from "sonner";

import type { Product } from "@/lib/admin-api";
import { resolveImageUrl } from "@/lib/admin-api";
import { resolveVariantPricing } from "@/lib/shop-api";
import { useCart } from "@/app/_providers/cart-provider";
import { useWishlist } from "@/app/_providers/wishlist-provider";

const money = (value: number) =>
  `৳${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Variant = NonNullable<Product["variants"]>[number];

/** "Weight" → ["200 g", "500 g"], preserving the order variants were created in. */
function buildAttributeGroups(product: Product) {
  const groups = new Map<string, string[]>();
  for (const variant of product.variants ?? []) {
    for (const attribute of variant.attributes ?? []) {
      const name = attribute.attributeValue?.attribute?.name;
      const value = attribute.attributeValue?.value;
      if (!name || !value) continue;
      const values = groups.get(name) ?? [];
      if (!values.includes(value)) values.push(value);
      groups.set(name, values);
    }
  }
  return [...groups.entries()].map(([name, values]) => ({ name, values }));
}

function variantValues(variant: Variant) {
  const map: Record<string, string> = {};
  for (const attribute of variant.attributes ?? []) {
    const name = attribute.attributeValue?.attribute?.name;
    const value = attribute.attributeValue?.value;
    if (name && value) map[name] = value;
  }
  return map;
}

export default function ProductDetails({ product }: { product: Product }) {
  const { addItem, buyNow } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();
  const [buyingNow, setBuyingNow] = useState(false);

  const gallery = useMemo(() => {
    const media = [...(product.media ?? [])].sort(
      (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.sortOrder - b.sortOrder,
    );
    return media.map((entry) => resolveImageUrl(entry.media.url)).filter(Boolean);
  }, [product.media]);

  const attributeGroups = useMemo(() => buildAttributeGroups(product), [product]);

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
    setBuyingNow(true);
    try {
      await buyNow(cartLine());
      router.push("/checkout");
    } catch {
      // The cart provider already reports why the line could not be added.
      setBuyingNow(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-8 md:py-14">
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-[#4a9e2f]">Home</Link>
        <span>/ </span>
        <Link href="/shop" className="hover:text-[#4a9e2f]">Shop</Link>
        <span>/ {product.name}</span>
      </nav>

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
                    index === activeImage ? "border-[#4a9e2f]" : "border-transparent hover:border-gray-200"
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
            <p className="text-sm uppercase tracking-wide text-[#4a9e2f]">{product.brand.name}</p>
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
              <span className="text-[#4a9e2f]">In stock — {selectedVariant?.stockQuantity} available</span>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
            {selectedVariant?.sku && (
              <span className="ml-3 text-gray-400">SKU: {selectedVariant.sku}</span>
            )}
          </p>

          {product.description && (
            <p className="mt-5 text-sm leading-relaxed text-gray-600">{product.description}</p>
          )}

          {/* Variant pickers, one row per attribute */}
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
                        ? "border-[#4a9e2f] bg-[#4a9e2f] text-white"
                        : "border-gray-200 text-gray-700 hover:border-[#4a9e2f]"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity + actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center border border-gray-200">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-11 w-11 items-center justify-center text-gray-600 hover:text-[#4a9e2f]"
              >
                <FiMinus size={15} />
              </button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="flex h-11 w-11 items-center justify-center text-gray-600 hover:text-[#4a9e2f]"
              >
                <FiPlus size={15} />
              </button>
            </div>

            <button
              type="button"
              onClick={onAddToCart}
              disabled={!inStock}
              className="flex h-11 flex-1 min-w-[170px] cursor-pointer items-center justify-center gap-2 border border-[#4a9e2f] bg-white px-6 text-sm font-medium text-[#4a9e2f] transition-all duration-200 hover:bg-[#f4f7ee] disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <FiShoppingCart size={16} />
              Add to Cart
            </button>

            <button
              type="button"
              onClick={onBuyNow}
              disabled={!inStock || buyingNow}
              className="flex h-11 flex-1 min-w-[170px] cursor-pointer items-center justify-center gap-2 bg-[#4a9e2f] px-6 text-sm font-medium text-white transition-all duration-200 hover:bg-[#3d8626] hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:shadow-none"
            >
              <FiZap size={16} />
              {buyingNow ? "Please wait…" : "Buy Now"}
            </button>

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
              className={`flex h-11 w-11 items-center justify-center border transition-colors ${
                wishlisted
                  ? "border-[#4a9e2f] bg-[#4a9e2f] text-white"
                  : "border-gray-200 text-gray-600 hover:border-[#4a9e2f] hover:text-[#4a9e2f]"
              }`}
            >
              <FiHeart size={17} fill={wishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Reassurance strip */}
          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-3">
            <Assurance icon={<FiTruck size={18} />} title="Free delivery" text="On orders over ৳2,000" />
            <Assurance icon={<FiRefreshCw size={18} />} title="Easy returns" text="Sealed items, 7 days" />
            <Assurance icon={<FiShield size={18} />} title="100% organic" text="Chemical free, certified" />
          </div>

          {product.tags?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag.id} className="bg-[#f4f7ee] px-3 py-1 text-xs text-[#4a9e2f]">
                  {tag.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
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
      <span className="mt-0.5 text-[#4a9e2f]">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-[#1f2a17]">{title}</p>
        <p className="text-xs text-gray-500">{text}</p>
      </div>
    </div>
  );
}
