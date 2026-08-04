"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";

import ProductCard from "@/components/storefront/shop/ProductCard";
import type { ShopProduct } from "@/lib/shop-api";

import "swiper/css";

interface MostLovedFoodsProps {
  products: ShopProduct[];
}

export default function MostLovedFoods({ products }: MostLovedFoodsProps) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  // `progress` is swiper's 0→1 scroll position; `span` is the share of the
  // track one screenful covers. Together they drive the progress bar below.
  const [progress, setProgress] = useState(0);
  const [span, setSpan] = useState(1);

  const syncProgress = (instance: SwiperClass) => {
    const perView = Number(instance.params.slidesPerView) || 1;
    setSpan(Math.min(1, perView / Math.max(products.length, 1)));
    setProgress(instance.progress);
  };

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1600px] px-4 md:px-8">
      <h2 className="font-display text-center text-[28px] leading-tight text-[#1f2a17] md:text-[38px]">
        Our Most Loved Foods
      </h2>

      <div className="relative mt-8 md:mt-10">
        <Swiper
          onSwiper={(instance) => {
            setSwiper(instance);
            syncProgress(instance);
          }}
          onProgress={syncProgress}
          onResize={syncProgress}
          spaceBetween={20}
          breakpoints={{
            0: { slidesPerView: 1.3 },
            640: { slidesPerView: 2.3 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>

        <CarouselArrow side="left" onClick={() => swiper?.slidePrev()} />
        <CarouselArrow side="right" onClick={() => swiper?.slideNext()} />
      </div>

      <div className="mt-8 flex justify-center">
        <div className="relative h-[3px] w-[130px] overflow-hidden rounded-full bg-gray-200">
          <span
            className="absolute inset-y-0 rounded-full bg-[#4a9e2f] transition-[left] duration-300"
            style={{
              width: `${span * 100}%`,
              left: `${progress * (100 - span * 100)}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

function CarouselArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous products" : "Next products"}
      className={`absolute top-[38%] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1f2a17] shadow-md transition-colors hover:bg-[#4a9e2f] hover:text-white lg:flex ${
        side === "left" ? "-left-4" : "-right-4"
      }`}
    >
      {side === "left" ? <PiCaretLeft size={18} /> : <PiCaretRight size={18} />}
    </button>
  );
}
