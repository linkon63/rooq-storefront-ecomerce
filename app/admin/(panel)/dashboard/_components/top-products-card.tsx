"use client";

import Image from "next/image";
import Link from "next/link";
import type { TopProduct } from "@/types/admin/dashboard";
import { formatMoney } from "@/utils/admin/format";
import { useCurrency } from "@/hooks/use-currency";
import { formatCount } from "@/utils/dashboard/format";
import { ProductThumb } from "../../../_components/admin-shell";

export function TopProductsCard({ products, isLoading }: { products: TopProduct[]; isLoading: boolean }) {
  const { symbol } = useCurrency();
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <h2 className="mb-5 text-2xl font-black">Best sellers</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }, (_, index) => <div className="h-20 animate-pulse rounded-xl bg-slate-100" key={index} />)
        ) : products.length === 0 ? (
          <p className="font-medium text-slate-400">No sales recorded in this period.</p>
        ) : (
          products.map((product) => (
            <Link
              className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50/60"
              href={`/admin/products/${product.id}/edit`}
              key={product.id}
            >
              <div className="relative h-14 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                {product.imageUrl ? (
                  <Image alt={product.name} className="object-cover" fill sizes="48px" src={product.imageUrl} unoptimized={!product.imageUrl.startsWith("/")} />
                ) : (
                  <ProductThumb />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-black">{product.name}</p>
                <p className="mt-1 text-sm font-medium text-slate-500 tabular-nums">
                  {formatCount(product.unitsSold)} sold, {formatMoney(product.revenue, symbol)}
                </p>
                <p className="text-xs font-medium text-slate-400 tabular-nums">{formatCount(product.stock)} pcs in stock</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
