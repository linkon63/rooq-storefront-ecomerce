"use client";

import type { ProductOption } from "@/types/admin/content";
import { productOptionImage } from "@/utils/admin/content";
import { AdminIcon } from "../../_components/admin-shell";

type Props = {
  products: ProductOption[];
  filtered: ProductOption[];
  selected: string[];
  search: string;
  isLoading: boolean;
  onSearch: (value: string) => void;
  onToggle: (productId: string) => void;
  onSelect: (productIds: string[]) => void;
};

/** Searchable checkbox list of products a discount applies to. */
export function DiscountProductPicker({ products, filtered, selected, search, isLoading, onSearch, onToggle, onSelect }: Props) {
  const visibleIds = filtered.map((p) => p.id);
  return (
    <div className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        Linked products <span className="text-red-500">*</span> ({selected.length} selected)
      </span>
      <div className="rounded-lg border border-slate-300">
        <label className="flex items-center gap-3 border-b border-slate-200 p-3">
          <AdminIcon className="h-5 w-5 shrink-0 text-slate-400" name="search" />
          <span className="sr-only">Search products</span>
          <input className="w-full bg-transparent text-sm font-medium outline-none" onChange={(e) => onSearch(e.target.value)} placeholder="Search products…" type="search" value={search} />
        </label>
        <div className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-center text-sm font-medium text-slate-500">Loading products…</p>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-center text-sm font-medium text-slate-500">
              {products.length === 0 ? "No products found." : "No products match your search."}
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              <div className="flex gap-2 bg-slate-50 px-3 py-2">
                <button className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-800" onClick={() => onSelect([...new Set([...selected, ...visibleIds])])} type="button">
                  Select all
                </button>
                <span aria-hidden className="text-slate-300">|</span>
                <button className="cursor-pointer text-sm font-semibold text-slate-600 hover:text-slate-800" onClick={() => onSelect(selected.filter((id) => !visibleIds.includes(id)))} type="button">
                  Clear
                </button>
              </div>
              {filtered.map((product) => {
                const checked = selected.includes(product.id);
                const image = productOptionImage(product);
                return (
                  <label className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-slate-50 ${checked ? "bg-blue-50" : ""}`} key={product.id}>
                    <input checked={checked} className="h-4 w-4 rounded border-slate-300 text-blue-600" onChange={() => onToggle(product.id)} type="checkbox" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{product.name}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="h-8 w-8 shrink-0 rounded border border-slate-200 object-cover" height={32} loading="lazy" src={image ?? "/images/no-image-icon-6.png"} width={32} />
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
