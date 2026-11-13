"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import type { ProductCard } from "@/types/storefront/catalog";
import { Price } from "../shared/price";
import { StarRating } from "../shared/star-rating";

/**
 * The card in the hero's bottom-right corner for the slide in focus: the
 * linked product's photo, name, price, rating and colours. The whole card
 * opens the product page. Re-keyed per product so it fades in on change.
 */
export function HeroProductCard({ product }: { product: ProductCard }) {
  return (
    <Link
      key={product.id}
      href={`/product/${product.slug}`}
      aria-label={`View details: ${product.name}`}
      className="group flex w-[min(19rem,calc(100vw-2rem))] animate-[fade-in_.45s_ease-out] items-stretch gap-3 bg-chalk/95 p-2.5 shadow-sheet ring-1 ring-ink/10 backdrop-blur-sm"
    >
      {product.image ? (
        <span className="relative hidden aspect-[3/4] w-16 shrink-0 overflow-hidden bg-selvedge/40 sm:block">
          <Image src={product.image.url} alt="" fill sizes="64px" className="object-cover" />
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
        <span className="type-meta truncate uppercase">{product.name}</span>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} className="type-meta" />
        {product.ratingCount > 0 ? <StarRating rating={product.ratingAvg} size={11} count={product.ratingCount} /> : null}
        {product.colors.length > 1 ? <span className="type-meta text-stone">{product.colors.length} colours</span> : null}
        <span className="type-label mt-auto inline-flex items-center gap-1 underline-offset-4 group-hover:underline">
          View details
          <FiArrowRight aria-hidden className="size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </span>
    </Link>
  );
}
