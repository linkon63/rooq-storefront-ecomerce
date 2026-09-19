"use client";

import { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import ProductCard from "./ProductCard";
import type { ShopProduct } from "@/lib/shop-api";

/**
 * Horizontal product rail used under the cart and on product pages.
 * Scrolls natively so it degrades gracefully without JS.
 */
export default function RelatedProducts({
  title,
  products,
}: {
  title: string;
  products: ShopProduct[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * (track.clientWidth * 0.8), behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-14 md:px-8 md:py-20">
      <h2 className="font-display mb-10 text-center text-3xl font-semibold text-[#1f2a17] md:text-4xl">
        {title}
      </h2>

      <div className="relative">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Previous products"
          className="absolute -left-2 top-1/3 z-10 hidden h-10 w-10 items-center justify-center border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:text-brand md:flex"
        >
          <FiChevronLeft size={18} />
        </button>

        <div
          ref={trackRef}
          className="grid snap-x grid-flow-col auto-cols-[minmax(220px,1fr)] gap-6 overflow-x-auto pb-2 md:auto-cols-[minmax(0,25%)] lg:gap-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div key={product.id} className="snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Next products"
          className="absolute -right-2 top-1/3 z-10 hidden h-10 w-10 items-center justify-center border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:text-brand md:flex"
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
