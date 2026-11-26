"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMoreProducts } from "@/hooks/use-more-products";
import type { PaginationMeta, ProductCard as ProductCardData } from "@/types/storefront/catalog";
import type { QueryParams } from "@/utils/query-string";
import { ProductCard } from "../product-card/product-card";

type Props = { query: QueryParams; meta: PaginationMeta };

/** Phones: the next pages load as the end of the grid comes near, with a button as the fallback. */
export function MoreProducts({ query, meta }: Props) {
  const isPhone = useMediaQuery("(width < 48rem)");
  const { products, hasMore, loading, error, loadMore } = useMoreProducts(query, meta);
  const sentinel = useRef<HTMLDivElement>(null);
  // A failed load waits for a tap instead of retrying on its own.
  const autoLoad = useEffectEvent(() => {
    if (!error) void loadMore();
  });

  useEffect(() => {
    const node = sentinel.current;
    if (!isPhone || !hasMore || !node) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && autoLoad(), { rootMargin: "600px" });
    observer.observe(node);
    return () => observer.disconnect();
    // Re-observed after each page so a still-visible end loads the next one.
  }, [isPhone, hasMore, products.length]);

  if (!isPhone) return null;

  return (
    <div className="flex flex-col gap-4">
      {products.length ? <Grid products={products} /> : null}
      {error ? (
        <p role="alert" className="text-center text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
      {hasMore ? (
        <div ref={sentinel}>
          <button type="button" disabled={loading} onClick={() => void loadMore()} className="press h-12 w-full rounded border border-ink text-sm font-semibold disabled:opacity-60">
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Grid({ products }: { products: ProductCardData[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-[3px] gap-y-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
