"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoSearch } from "react-icons/io5";
import { useProductSearch } from "@/hooks/useProductSearch";
import { ProductItem } from "@/types/shop";

export default function SearchPopup() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { searchResults, isLoading, error, search } = useProductSearch();

  useEffect(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };

    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleProductClick = (product: ProductItem) => {
    router.push(`/product/${product.id}`);

    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(true)}>
        <IoSearch size={24} />
      </button>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

        <div className="relative z-50 flex justify-center mt-10 px-4">
          <div
            ref={wrapperRef}
            className={`w-full max-w-2xl rounded-xl bg-white shadow-2xl
              transform transition-all duration-300 ease-out
              ${open
                ? "scale-100 opacity-100"
                : "scale-95 opacity-0"
              }
            `}
          >
            <div className="border-b border-gray-200 px-4 py-3">
              <input
                autoFocus={open}
                type="text"
                placeholder="Search Products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-sm outline-none"
              />
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading && query && (
                <div className="space-y-0">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 animate-pulse"
                    >
                      <div className="h-12 w-12 rounded bg-gray-200"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && !isLoading && (
                <p className="px-4 py-6 text-center text-sm text-red-500">
                  {error}
                </p>
              )}

              {!isLoading && !error && query && searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleProductClick(item)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                      {item.thumbnail && (
                        <Image
                          src={item.thumbnail}
                          alt={item.name || "Product"}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-black">
                          ৳ {item.price_min}
                        </span>
                        {item.price_max > item.price_min && (
                          <span className="line-through text-gray-400">
                            ৳ {item.price_max}
                          </span>
                        )}
                        {item.discount > 0 && (
                          <span className="text-red-500">
                            -{item.discount}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : !isLoading && !error && query ? (
                <p className="px-4 py-6 text-center text-sm text-gray-500">
                  Products not found
                </p>
              ) : !query ? (
                <p className="px-4 py-10 text-center text-sm text-gray-400">
                  Search Products
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
