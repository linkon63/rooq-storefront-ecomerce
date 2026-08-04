"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/storefront/sections/ProductCard";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import { getLocalizedText } from "@/utils/convert";

interface JustForYouProps {
  products?: Product[];
  categories?: Category[];
}

export default function JustForYou({ products = [], categories = [] }: JustForYouProps) {
  const displayCategories = categories.slice(0, 5);
  const displayProducts: Product[] = products.slice(0, 12);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categoryTabs = useMemo(() => {
    const names = displayCategories
      .map((cat) => getLocalizedText(cat.name) || "Category")
      .filter(Boolean);
    return ["All", ...Array.from(new Set(names))];
  }, [displayCategories]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return displayProducts;
    return displayProducts.filter((product) => {
      const category = product.category;
      if (typeof category === "string") {
        return category === selectedCategory;
      }
      if (category?.name) {
        return getLocalizedText(category.name) === selectedCategory;
      }
      return false;
    });
  }, [displayProducts, selectedCategory]);

  return (
    <section className="w-full max-w-[1737px] mx-auto px-4 sm:px-6 lg:px-4">
      {/* Section Header */}
      <div className="text-center mb-10 sm:mb-12 md:mb-14 lg:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">
          Just For You
        </h2>

        <nav className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 sm:gap-x-5 text-xs sm:text-sm tracking-widest text-gray-500">
          {categoryTabs.map((categoryName) => (
            <button
              type="button"
              title="Categories"
              key={categoryName}
              onClick={() => setSelectedCategory(categoryName)}
              aria-pressed={selectedCategory === categoryName}
              className={`transition-all duration-200 hover:scale-105 cursor-pointer ${
                selectedCategory === categoryName ? "font-bold text-gray-900" : "text-gray-500"
              }`}
            >
              {categoryName}
            </button>
          ))}
        </nav>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No products found for this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* See All Button */}
      <div className="mt-8 sm:mt-10 md:mt-12 lg:mt-14 flex items-center justify-center">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white text-sm sm:text-base font-semibold px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 shadow-md hover:shadow-lg transition-all duration-200 uppercase tracking-wide"
        >
          SEE ALL PRODUCT
        </Link>
      </div>
    </section>
  );
}
