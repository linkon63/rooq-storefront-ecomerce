"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { PiCaretLeft, PiCaretRight } from "react-icons/pi";

import "swiper/css";
import "swiper/css/effect-fade";

export type HeroSlide = { image: string; href: string; alt: string };

interface HomeHeroProps {
  /** Wide slides for the main stage — campaign banners, newest first. */
  slides: HeroSlide[];
  /** The two stacked banners on the right of the stage. */
  banners: HeroSlide[];
}

export default function HomeHero({ slides, banners }: HomeHeroProps) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="mx-auto max-w-[1600px] px-4 pt-4 md:px-8 md:pt-6">
      {/* Below lg the stage and the side banners fold into one swipeable slider. */}
      <MobileHeroSlider slides={[...slides, ...banners]} />

      {/* 32% keeps the two stacked banners exactly as tall as the main stage. */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_32%] lg:gap-8">
        {/* ── Main stage ──────────────────────────────────────────────── */}
        <div className="group relative overflow-hidden rounded-lg bg-brand-mist">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop={slides.length > 1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            onSwiper={setSwiper}
            onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
            className="h-full"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={`${slide.image}-${index}`}>
                <Link href={slide.href} className="block">
                  <div className="relative aspect-[1144/640] w-full">
                    <Image
                      src={slide.image}
                      alt={slide.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 70vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {slides.length > 1 && (
            <>
              <HeroArrow
                side="left"
                onClick={() => swiper?.slidePrev()}
                label="Previous slide"
              />
              <HeroArrow
                side="right"
                onClick={() => swiper?.slideNext()}
                label="Next slide"
              />

              {/* Dashes, bottom centre. */}
              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                {slides.map((slide, index) => (
                  <button
                    key={`dot-${slide.image}-${index}`}
                    type="button"
                    onClick={() => swiper?.slideToLoop(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === activeIndex}
                    className={`h-[3px] rounded-full transition-all ${
                      index === activeIndex
                        ? "w-9 bg-brand"
                        : "w-7 bg-white/70 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Side banners ────────────────────────────────────────────────
            On desktop the pair stretches to the height of the main stage, so
            the two columns always end on the same line. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 lg:gap-8">
          {banners.map((banner) => (
            <Link
              key={banner.image}
              href={banner.href}
              className="relative block overflow-hidden rounded-lg"
            >
              <div className="relative aspect-[552/300] w-full lg:h-full lg:aspect-auto">
                <Image
                  src={banner.image}
                  alt={banner.alt}
                  fill
                  sizes="(max-width: 1024px) 50vw, 430px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Phones and tablets: every hero artwork in one slider, swiped or auto-advanced every 3s. */
function MobileHeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative overflow-hidden rounded-lg bg-brand-mist lg:hidden">
      <Swiper
        modules={[Autoplay]}
        loop={slides.length > 1}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        onSwiper={setSwiper}
        onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={`${slide.image}-${index}`}>
            <Link href={slide.href} className="block">
              <div className="relative aspect-[1144/640] w-full">
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={`dot-${slide.image}-${index}`}
              type="button"
              onClick={() => swiper?.slideToLoop(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === activeIndex}
              className={`h-[3px] rounded-full transition-all ${
                index === activeIndex ? "w-7 bg-brand" : "w-5 bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HeroArrow({
  side,
  onClick,
  label,
}: {
  side: "left" | "right";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1f2a17] shadow-md transition-all hover:bg-brand hover:text-white ${
        side === "left" ? "left-3" : "right-3"
      }`}
    >
      {side === "left" ? <PiCaretLeft size={18} /> : <PiCaretRight size={18} />}
    </button>
  );
}
