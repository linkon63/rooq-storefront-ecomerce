"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiEye, FiHeart, FiShoppingCart } from "react-icons/fi";
import { toast } from "sonner";

import type { ShopProduct } from "@/lib/shop-api";
import { useCart } from "@/app/_providers/cart-provider";
import { useWishlist } from "@/app/_providers/wishlist-provider";

const money = (value: number) =>
  `৳${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function ProductCard({ product }: { product: ShopProduct }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Product pages are addressed by id, per the catalogue routing.
  const href = `/product/${product.id}`;
  const wishlisted = isInWishlist(product.id);
  const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;

  const onAddToCart = () => {
    // Belt and braces — the button is not rendered for unreleased products,
    // but nothing should be able to push one into the cart.
    if (product.comingSoon) return;
    void addItem({
      slug: product.slug,
      productId: product.id,
      variantId: product.variantId,
      name: product.name,
      price: product.price,
      originalPrice: hasDiscount ? product.originalPrice : undefined,
      image: product.image,
      color: "",
      size: "",
      quantity: 1,
    });
  };

  const onToggleWishlist = () => {
    toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
    } as Parameters<typeof toggleWishlist>[0]);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link href={href} aria-label={product.name}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
        </Link>

        {/* Coming soon — always visible, not a hover state, since it changes
            what the card can do rather than decorating it. */}
        {product.comingSoon && (
          <span className="absolute left-3 top-3 z-10 bg-[#1f2a17] px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-white">
            Coming Soon
          </span>
        )}

        {/* Hover actions — quick view and wishlist stack top-right. */}
        <div className="pointer-events-none absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
          <button
            type="button"
            onClick={() => router.push(href)}
            aria-label={`View ${product.name}`}
            className="flex h-9 w-9 items-center justify-center bg-white text-[#1f2a17] shadow-sm transition-colors hover:bg-[#4a9e2f] hover:text-white"
          >
            <FiEye size={16} />
          </button>
          <button
            type="button"
            onClick={onToggleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            className={`flex h-9 w-9 items-center justify-center shadow-sm transition-colors ${
              wishlisted
                ? "bg-[#4a9e2f] text-white"
                : "bg-white text-[#1f2a17] hover:bg-[#4a9e2f] hover:text-white"
            }`}
          >
            <FiHeart size={16} fill={wishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Add to cart — label plus button, bottom-right. Unreleased products
            get a wishlist prompt in its place; there is nothing to add yet. */}
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
          {product.comingSoon ? (
            /* Kept short on purpose — the card clips its overflow, and this
               sits in a half-width column on mobile. */
            <span className="whitespace-nowrap bg-white/95 px-3 py-1.5 text-xs font-medium text-[#1f2a17]">
              Wishlist it
            </span>
          ) : (
            <>
              <span className="whitespace-nowrap bg-[#1f2a17] px-3 py-1.5 text-xs font-medium text-white">
                Add to Cart
              </span>
              <button
                type="button"
                onClick={onAddToCart}
                aria-label={`Add ${product.name} to cart`}
                className="flex h-9 w-9 cursor-pointer items-center justify-center bg-[#4a9e2f] text-white transition-all duration-200 hover:scale-110 hover:bg-[#3d8626] hover:shadow-md"
              >
                <FiShoppingCart size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link
          href={href}
          className="font-display block text-[17px] text-[#1f2a17] transition-colors hover:text-[#4a9e2f]"
        >
          {product.name}
        </Link>
        <p className="mt-1.5 flex items-center justify-center gap-2">
          {hasDiscount && (
            <span className="font-display text-sm text-gray-400 line-through">
              {money(product.originalPrice!)}
            </span>
          )}
          <span className="font-display text-[17px] font-semibold text-[#1f2a17]">
            {money(product.price)}
          </span>
        </p>
      </div>
    </div>
  );
}
