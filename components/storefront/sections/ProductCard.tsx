"use client";

import Image from "next/image";
import { useMemo } from "react";
import { IoCartOutline } from "react-icons/io5";
import { BiSolidOffer } from "react-icons/bi";
import { Product } from "@/types/product";
import { getLocalizedText, parsePrice } from "@/utils/convert";
import { getDiscountFromAmount } from "@/utils/amount";
import { useCart } from "@/app/_providers/cart-provider";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  viewLayout?: string;
}

const BADGE_OPTIONS = [
  "Trending",
  "On Sale",
  "Best Sell",
  "Exclusive Limited Edition",
  "New",
];

const getRandomBadge = () =>
  BADGE_OPTIONS[Math.floor(Math.random() * BADGE_OPTIONS.length)];

const getProductImage = (product: Product) =>
  product.media?.[0]?.original_url || "/assets/image/placeholder.png";

export default function ProductCard({ product, viewLayout = 'grid' }: ProductCardProps) {
  const { addItem } = useCart();
  const displayName = getLocalizedText(product.name) || "Product";
  const imageUrl = getProductImage(product);
  // Product ids are uuids here, so derive a stable badge from a character sum
  // rather than a numeric modulo.
  const badge = useMemo(() => {
    const key = String(product.id);
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash += key.charCodeAt(i);
    return BADGE_OPTIONS[hash % BADGE_OPTIONS.length];
  }, [product.id]);
  const productHref = `/product/${product.slug ?? product.id}`;

  const variant = product.variants?.[0];

  // Our API returns a flat price on the product; the variant pricing shape is
  // kept as a fallback for payloads that still carry it.
  const price =
    parsePrice(product.price) ??
    parsePrice(variant?.discount_price) ??
    parsePrice(variant?.current_pricing?.retail_price) ??
    parsePrice(variant?.current_pricing?.unit_price)

  const computedDiscount = getDiscountFromAmount(product);

  const discount = computedDiscount > 0 ? computedDiscount : 2;

  const handleAddToCart = () => {
    void addItem({
      slug: product.slug ?? String(product.id),
      productId: String(product.id),
      variantId: variant?.id ? String(variant.id) : undefined,
      name: displayName,
      price: price ?? 0,
      image: imageUrl,
      color: "",
      size: "",
      quantity: 1,
    });
  };

  // List View Layout
  if (viewLayout === 'list') {
    return (
      <div className="group flex gap-6 border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-300">
        {/* Image Section - Fixed Width */}
        <Link href={productHref} className="relative flex-shrink-0 w-48 h-48 overflow-hidden">
          {badge && (
            <span className="absolute top-2 left-2 bg-black/80 text-white text-xs font-semibold px-3 py-1.5 tracking-wider z-10">
              {badge}
            </span>
          )}
          <Image
            src={imageUrl}
            alt={displayName}
            width={192}
            height={192}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between">
          <Link href={productHref}>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{displayName}</h3>
              <div className="flex flex-wrap items-baseline space-x-3 mb-3">
                <p className="text-xl font-bold text-gray-900">৳{price}</p>
                {discount && (
                  <span className="flex items-center gap-1 bg-gray-800 text-white text-xs font-bold px-2 py-1">
                    <BiSolidOffer />
                    {discount}% OFF
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Add to Cart Button */}
          <div>
            <button
              className="bg-black text-white px-6 py-3 flex items-center space-x-2 cursor-pointer hover:bg-brand hover:shadow-lg transition-all duration-200 text-sm font-semibold w-full sm:w-auto justify-center"
              type="button"
              onClick={handleAddToCart}
            >
              <IoCartOutline />
              <span>ADD TO CART</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Layout (Default)
  return (
    <Link href={productHref}>
      <div className="group pb-20 sm:pb-6 lg:pb-10">
        <div className="relative overflow-hidden h-full">
          {badge && (
            <span className="absolute top-3 left-3 bg-black/80 text-white text-xs font-semibold px-3 py-1.5 tracking-wider z-10">
              {badge}
            </span>
          )}

          <Image
            src={imageUrl}
            alt={displayName}
            width={400}
            height={400}
            className="w-full h-full  object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              className="bg-white cursor-pointer text-black px-5 py-2.5 sm:px-6 sm:py-3 flex items-center space-x-2 hover:bg-brand hover:text-white hover:scale-105 transition-all duration-200 text-sm sm:text-base font-semibold shadow-lg"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
            >
              <IoCartOutline />
              <span>ADD TO CART</span>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex h-10 items-center">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{displayName}</h3>
          </div>

          <div className="flex flex-wrap items-baseline space-x-2 mt-1">
            <p className="text-base font-bold text-gray-900">৳{price}</p>

            {product.variants && product.variants[0].discount_amount && (
              <span className="flex items-center gap-1 bg-gray-800 text-white text-xs font-bold px-2 py-1">
                <BiSolidOffer />
                {discount}% OFF
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
