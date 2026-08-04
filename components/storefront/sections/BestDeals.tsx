"use client";

import Link from "next/link";
import { useState } from "react";
import { RiArrowRightUpLine } from "react-icons/ri";
import { GrPrevious, GrNext } from "react-icons/gr";
import ProductCard from "@/components/storefront/sections/ProductCard";
import type { Product } from "@/types/product";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

interface BestDealsProps {
  products?: Product[];
}

export default function BestDeals({ products = [] }: BestDealsProps) {
  const displayProducts = products.slice(0, 12);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <section className="w-full max-w-[1737px] mx-auto px-4 sm:px-6 lg:px-4">
      {/* Section Header */}
      <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
          Today&apos;s Best Deals
        </h2>

        <div className="all-products underline">
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-gray-900 hover:text-gray-700 transition-colors duration-200 flex items-center group"
          >
            See All Product
            <RiArrowRightUpLine size={20} />
          </Link>
        </div>
      </div>

      {/* Swiper Slider */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          title="Previous"
          aria-disabled={isBeginning}
          className={`swiper-button-prev-best hidden lg:flex absolute -left-6 top-1/2 -translate-y-1/2 bg-white p-6 shadow-xl border border-gray-100 z-10 cursor-pointer transition-opacity ${
            isBeginning ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <GrPrevious size={24} />
        </button>

        <button
          title="Next"
          aria-disabled={isEnd}
          className={`swiper-button-next-best hidden lg:flex absolute -right-6 top-1/2 -translate-y-1/2 bg-white p-6 shadow-xl border border-gray-100 z-10 cursor-pointer transition-opacity ${
            isEnd ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <GrNext size={24} />
        </button>

        <Swiper
          modules={[Navigation]}
          navigation={{
            nextEl: ".swiper-button-next-best",
            prevEl: ".swiper-button-prev-best",
          }}
          onSwiper={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          spaceBetween={0}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-10"
        >
          {displayProducts.map((product) => {
            return (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
