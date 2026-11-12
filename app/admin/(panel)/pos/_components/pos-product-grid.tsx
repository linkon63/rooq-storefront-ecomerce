"use client";

import Image from "next/image";
import { useState } from "react";
import { formatMoney } from "@/utils/admin/format";
import type { ProductCard } from "@/utils/mappers/product-card";
import { AdminIcon } from "../../../_components/admin-shell";
import { usePosProducts } from "../_hooks/use-pos-products";

type Props = { symbol: string; onPick: (product: ProductCard) => void };

export function PosProductGrid({ symbol, onPick }: Props) {
  const [search, setSearch] = useState("");
  const { products, isLoading, error } = usePosProducts(search);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <label className="mb-5 flex h-12 items-center gap-3 rounded-lg border-2 border-slate-200 px-4 focus-within:border-blue-500">
        <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
        <span className="sr-only">Search products</span>
        <input
          autoComplete="off"
          className="w-full bg-transparent text-sm outline-none"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search product, style code or SKU…"
          type="search"
          value={search}
        />
      </label>
      {error ? <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div className="h-24 animate-pulse rounded-xl bg-slate-100" key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-sm font-semibold text-slate-400">No products in stock match this search.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <button
                className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-3 text-left transition-colors hover:border-slate-400"
                onClick={() => onPick(product)}
                type="button"
              >
                {product.image ? (
                  <Image alt={product.name} className="h-16 w-14 shrink-0 rounded-md object-cover" height={64} src={product.image.url} width={56} />
                ) : (
                  <span aria-hidden className="h-16 w-14 shrink-0 rounded-md bg-slate-100" />
                )}
                <span className="min-w-0">
                  <b className="block truncate text-sm text-slate-800">{product.name}</b>
                  <span className="text-xs text-slate-500">{product.brand.name}</span>
                  <span className="mt-1 block text-sm font-semibold tabular-nums text-slate-900">
                    {formatMoney(product.price, symbol)}
                    {product.compareAtPrice ? <s className="ml-2 text-xs font-normal text-slate-400">{formatMoney(product.compareAtPrice, symbol)}</s> : null}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
