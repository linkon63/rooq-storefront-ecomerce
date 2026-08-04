"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { getLocalizedText } from "@/utils/convert";

interface HeroTwoProps {
  products?: Product[];
}

export default function HeroTwo({ products = [] }: HeroTwoProps) {
  const featuredProduct: Product | undefined =
    products.length > 1 ? products[1] : products[0];

  const title =
    getLocalizedText(featuredProduct?.name) ||
    "Your Trusted Building Material Supplier";
  const description =
    getLocalizedText(featuredProduct?.description) ||
    "These shoes offer incredible comfort and style. These shoes offer incredible comfort and style. Perfect for every occasion. These shoes offer incredible comfort and style.";
  const imageUrl =
    featuredProduct?.media?.[0]?.original_url ||
    "/assets/image/hero/hero-2.png";

  return (
    <section className="w-full lg:px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 mx-auto h-[752px]">
        {/* LEFT PANEL - Hero Image */}
        <div className="relative w-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover w-full"
          />
        </div>

        {/* RIGHT PANEL - Content */}
        <div className="px-6 py-12 sm:px-8 sm:py-16 md:px-12 md:py-20 lg:px-16 xl:px-24 my-12 flex flex-col justify-center order-2 md:order-2 bg-gray-900 text-white">
          <div className="max-w-xl w-full">
            <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {title}
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-8 max-w-md">
              {description}
            </p>

            <div>
              <Link
                href="/shop"
                className="bg-white text-gray-900 px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                SHOP NOW
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
