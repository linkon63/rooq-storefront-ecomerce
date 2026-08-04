"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

import { SliderItem, FlattenedSlide } from '@/types/campain';

interface HeroClientProps {
  sliderItems: SliderItem[];
}

export default function HeroClient({ sliderItems }: HeroClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const flattenedSlides: FlattenedSlide[] = [];
  
  sliderItems.forEach((item, itemIdx) => {
    if (item.type === 'campaign') {
      flattenedSlides.push({
        type: 'campaign',
        image: item.image,
        title: item.title,
        description: item.description,
        productId: item.productId,
        productImages: item.productImages,
        itemIdx,
        slideIdx: 0,
      });
    } else {
      (item.productImages || []).forEach((image, imgIdx) => {
        flattenedSlides.push({
          type: 'product-image',
          image,
          title: item.title,
          description: item.description,
          productId: item.productId,
          productImages: item.productImages,
          itemIdx,
          slideIdx: imgIdx,
        });
      });
    }
  });

  const currentSlideData = flattenedSlides[currentSlide];
  const isProductImageSlide = currentSlideData?.type === 'product-image';

  return (
    <section className="w-full h-[80vh] bg-gray-50 relative overflow-hidden">
      <Swiper
        loop={true}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{
          delay: isProductImageSlide ? 2000 : 5000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay, EffectFade]}
        className="w-full h-full"
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex)}
      >
        {flattenedSlides.map((slide, idx) => (
          <SwiperSlide key={idx + 'campaign'} className="w-full h-full">
            {slide.type === 'campaign' ? (
              <Image
                src={slide.image}
                alt="Campaign"
                fill
                className="object-cover object-center"
                priority={idx === 0}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 h-full">

                <div className="px-6 py-8 sm:px-8 sm:py-6 md:px-12 md:py-16 lg:px-16 xl:px-20 flex flex-col justify-center order-2 md:order-1 bg-white">
                  <div className="max-w-xl w-full">
                    <h2 className="text-gray-900 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight sm:leading-tight md:leading-[1.2] text-left line-clamp-3">
                      {slide.title || 'Product'}
                    </h2>

                    <p className="mt-2.5 sm:mt-4 md:mt-6 text-sm sm:text-base md:text-lg text-gray-500 leading-relaxed max-w-prose text-left line-clamp-4">
                      {slide.description || 'Discover our latest collection'}
                    </p>

                    <div className="mt-4 sm:mt-6 md:mt-8">
                      <Link
                        href={slide.productId ? `/product/${slide.productId}` : "/shop"}
                        className="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white text-sm sm:text-base font-semibold px-6 sm:px-8 py-2.5 sm:py-3 md:py-3.5 shadow-md hover:shadow-lg transition-all duration-200 uppercase tracking-wide"
                      >
                        View Product
                      </Link>
                    </div>

                    <div className="hidden md:block mt-8 md:mt-10 lg:mt-14">
                      <div className="flex items-center gap-4">
                        {slide.productImages?.map((image, imgIdx) => (
                          <button
                            key={imgIdx + 'product-image'}
                            onClick={() => {
                              const targetSlideIdx = flattenedSlides.findIndex(
                                (s) => s.type === 'product-image' && s.slideIdx === imgIdx && s.itemIdx === slide.itemIdx
                              );
                              if (targetSlideIdx !== -1) {
                                const swiperElement = document.querySelector('.swiper') as HTMLElement & { swiper: { slideTo: (index: number) => void } };
                                if (swiperElement?.swiper) {
                                  swiperElement.swiper.slideTo(targetSlideIdx);
                                }
                              }
                            }}
                            className={`relative shrink-0 transition-all ${
                              slide.slideIdx === imgIdx
                                ? 'ring-2 ring-gray-900 scale-105'
                                : 'opacity-60 hover:opacity-100'
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`Thumbnail ${imgIdx + 1}`}
                              width={80}
                              height={80}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-gray-300 hover:border-gray-900"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative w-full h-[35vh] lg:h-full order-1 md:order-2 bg-gray-100">
                  <Image
                    src={slide.image}
                    alt={`Product ${slide.slideIdx + 1}`}
                    fill
                    className="object-cover object-center"
                    priority={true}
                  />

                  <div className="absolute inset-0 hidden md:block vignette"></div>
                </div>

                <div className="md:hidden bg-white px-6 py-4 sm:px-8 sm:py-6 order-3 flex items-center gap-3 overflow-x-auto">
                  {slide.productImages?.map((image, imgIdx) => (
                    <button
                      key={imgIdx + 'product-image-mobile'}
                      onClick={() => {
                        const targetSlideIdx = flattenedSlides.findIndex(
                          (s) => s.type === 'product-image' && s.slideIdx === imgIdx && s.itemIdx === slide.itemIdx
                        );
                        if (targetSlideIdx !== -1) {
                          const swiperElement = document.querySelector('.swiper') as HTMLElement & { swiper: { slideTo: (index: number) => void } };
                          if (swiperElement?.swiper) {
                            swiperElement.swiper.slideTo(targetSlideIdx);
                          }
                        }
                      }}
                      className={`relative shrink-0 transition-all ${
                        slide.slideIdx === imgIdx
                          ? 'ring-2 ring-gray-900 scale-105'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${imgIdx + 1}`}
                        width={64}
                        height={64}
                        className="w-14 h-14 sm:w-16 sm:h-16 object-cover border-2 border-gray-300 hover:border-gray-900"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
