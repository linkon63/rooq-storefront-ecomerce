"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductCard } from "@/types/storefront/catalog";
import { Price } from "../shared/price";

type Props = {
  results: ProductCard[] | null;
  error: string | null;
  term: string;
  onNavigate: () => void;
};

export function SearchResults({ results, error, term, onNavigate }: Props) {
  if (error) {
    return (
      <p role="alert" className="text-sm text-dye-deep">
        {error}
      </p>
    );
  }
  if (!results) return <p className="text-sm text-stone" aria-live="polite">Searching…</p>;
  if (results.length === 0) {
    return (
      <p className="text-sm text-stone" aria-live="polite">
        Nothing matches “{term}”. Try a broader word, like “shirt” or “dress”.
      </p>
    );
  }
  return (
    <div aria-live="polite">
      <ul className="flex flex-col gap-3">
        {results.map((product) => (
          <li key={product.id}>
            <Link href={`/product/${product.slug}`} onClick={onNavigate} className="flex items-center gap-3 rounded p-1 hover:bg-chalk">
              <span className="relative size-16 shrink-0 overflow-hidden bg-selvedge">
                {product.image ? (
                  <Image src={product.image.url} alt={product.image.alt ?? product.name} fill sizes="64px" className="object-cover" />
                ) : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{product.name}</span>
                <Price price={product.price} compareAtPrice={product.compareAtPrice} className="text-sm" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={`/shop?q=${encodeURIComponent(term)}`}
        onClick={onNavigate}
        className="mt-4 inline-block text-sm font-semibold underline underline-offset-4"
      >
        See all results for “{term}”
      </Link>
    </div>
  );
}
