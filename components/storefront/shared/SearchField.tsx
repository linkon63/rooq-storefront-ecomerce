"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

import { useProductSearch } from "@/hooks/useProductSearch";
import type { ProductItem } from "@/types/shop";

const money = (value: number) =>
  `৳${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Header search: debounced suggestions as you type, Enter (or the button) hands
 * the term over to the shop page, which owns the full result list.
 */
export default function SearchField({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { searchResults, isLoading, error, search } = useProductSearch();

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const term = query.trim();

  useEffect(() => {
    search(query);
    setHighlighted(-1);
  }, [query, search]);

  // Close the panel on an outside click.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen]);

  const goToProduct = (product: ProductItem) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/product/${product.id}`);
  };

  const goToResults = () => {
    setIsOpen(false);
    router.push(term ? `/shop?search=${encodeURIComponent(term)}` : "/shop");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (!searchResults.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setHighlighted((index) => (index + 1) % searchResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((index) => (index <= 0 ? searchResults.length - 1 : index - 1));
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const picked = searchResults[highlighted];
    if (picked) {
      goToProduct(picked);
      return;
    }
    goToResults();
  };

  const showPanel = isOpen && term.length > 0;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={onSubmit}>
        <div className="relative">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={onKeyDown}
            type="search"
            placeholder="Search for Products"
            aria-label="Search for products"
            aria-expanded={showPanel}
            aria-controls="search-suggestions"
            role="combobox"
            autoComplete="off"
            className="h-11 w-full rounded-full border border-gray-200 pl-5 pr-14 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#4a9e2f]"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#4a9e2f] text-white transition-colors hover:bg-[#3d8626]"
          >
            <FiSearch size={16} />
          </button>
        </div>
      </form>

      {showPanel && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
        >
          {isLoading && (
            <div className="space-y-1 p-2">
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex animate-pulse items-center gap-3 px-2 py-2">
                  <div className="h-11 w-11 rounded bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-gray-100" />
                    <div className="h-3 w-1/3 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && error && (
            <p className="px-4 py-6 text-center text-sm text-red-500">{error}</p>
          )}

          {!isLoading && !error && searchResults.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-gray-500">
              No products match “{term}”.
            </p>
          )}

          {!isLoading && !error && searchResults.length > 0 && (
            <>
              <ul className="max-h-[360px] overflow-y-auto py-1">
                {searchResults.map((product, index) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === highlighted}
                      onMouseEnter={() => setHighlighted(index)}
                      onClick={() => goToProduct(product)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        index === highlighted ? "bg-[#f4f7ee]" : "hover:bg-[#f4f7ee]"
                      }`}
                    >
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-gray-50">
                        {product.thumbnail && (
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-[#1f2a17]">
                          {product.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-2 text-xs">
                          <span className="font-semibold text-[#1f2a17]">
                            {money(product.price_min)}
                          </span>
                          {product.price_max > product.price_min && (
                            <span className="text-gray-400 line-through">
                              {money(product.price_max)}
                            </span>
                          )}
                          {product.category && (
                            <span className="truncate text-gray-400">{product.category}</span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={goToResults}
                className="block w-full border-t border-gray-100 px-4 py-3 text-center text-sm text-[#4a9e2f] transition-colors hover:bg-[#f4f7ee]"
              >
                See all results for “{term}”
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
