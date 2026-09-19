"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ProductCard from "@/components/storefront/shop/ProductCard";
import type { ShopCategory, ShopProduct } from "@/lib/shop-api";

interface MostRecentItemsProps {
  products: ShopProduct[];
  categories: ShopCategory[];
}

/** How many cards the grid shows — two rows of four, as in the design. */
const GRID_SIZE = 8;

export default function MostRecentItems({ products, categories }: MostRecentItemsProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Only top-level categories get a chip; the row holds six comfortably.
  const chips = useMemo(
    () => categories.filter((category) => !category.parentId).slice(0, 6),
    [categories],
  );

  const visibleProducts = useMemo(() => {
    const list = activeCategory
      ? products.filter((product) => product.category === activeCategory)
      : products;
    return list.slice(0, GRID_SIZE);
  }, [products, activeCategory]);

  return (
    <section className="mx-auto max-w-[1600px] px-4 md:px-8">
      <h2 className="font-display text-center text-[22px] font-bold leading-tight md:font-semibold text-[#1f2a17] md:text-[38px]">
        Most Recent Item
      </h2>

      {chips.length > 0 && (
        <div className="mt-8 flex justify-start gap-6 overflow-x-auto pb-2 [scrollbar-width:none] md:mt-10 [&::-webkit-scrollbar]:hidden md:justify-center md:gap-10 lg:gap-14">
          {chips.map((category) => {
            const isActive = activeCategory === category.name;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(isActive ? null : category.name)}
                aria-pressed={isActive}
                className="group flex w-[86px] shrink-0 flex-col items-center gap-2 md:w-[104px]"
              >
                <span
                  className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 bg-white transition-colors ${
                    isActive ? "border-brand" : "border-gray-100 group-hover:border-brand/40"
                  }`}
                >
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-display text-lg text-brand">
                      {category.name.charAt(0)}
                    </span>
                  )}
                </span>
                <span
                  className={`text-center text-[13px] leading-tight transition-colors ${
                    isActive ? "text-brand" : "text-[#1f2a17] group-hover:text-brand"
                  }`}
                >
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {visibleProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-9 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-sm text-gray-500">
          Nothing in this category just yet — check back soon.
        </p>
      )}

      <div className="mt-10 flex justify-center">
        <Link
          href={activeCategory ? `/shop?category=${encodeURIComponent(activeCategory)}` : "/shop"}
          className="font-display rounded-full bg-brand px-7 py-2.5 text-[15px] text-white transition-colors hover:bg-brand-dark"
        >
          See All Product
        </Link>
      </div>
    </section>
  );
}
