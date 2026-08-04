"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Category } from "@/types/category";

interface CategoriesProps {
  categories?: Category[];
}

export default function Categories({ categories = [] }: CategoriesProps) {
  const router = useRouter();

  // Handle category click — the shop page filters from the query string.
  const handleCategoryClick = (categoryName: string) => {
    router.push(`/shop?category=${encodeURIComponent(categoryName)}`);
  };
  return (
    <section className="w-full max-w-[1737px] mx-auto px-4 sm:px-6 lg:px-4 py-8 md:py-12">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 md:gap-8">
        {categories.length > 0 &&
          categories.slice(0, 8).map((category, index) => {
            const categoryName =
              typeof category.name === "string"
                ? category.name
                : category.name?.en || "Unnamed Category";
            return (
              <div
                key={category.id ?? index}
                onClick={() => handleCategoryClick(categoryName)}
                className="group flex flex-col items-center text-center space-y-3 sm:space-y-4 cursor-pointer transition-transform duration-300 hover:scale-105"
              >
                {/* Optimized Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32  bg-white rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300 overflow-hidden">
                  <Image
                    src={
                      category.media?.[0]?.original_url ||
                      "/assets/image/placeholder.png"
                    }
                    alt={categoryName}
                    width={80}
                    height={80}
                    className="object-contain w-12 h-12 md:w-16 md:h-16 lg:w-24 lg:h-24"
                    priority={index < 3}
                  />
                </div>

                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                  {categoryName}
                </h3>
              </div>
            );
          })}
      </div>
    </section>
  );
}
