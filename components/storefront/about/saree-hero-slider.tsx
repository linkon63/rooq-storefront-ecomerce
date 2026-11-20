"use client";

import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

export type SareeSlide = {
  name: string;
  origin: string;
  details: string;
};

type SareeHeroSliderProps = {
  eyebrow: string;
  slides: readonly SareeSlide[];
  prevLabel: string;
  nextLabel: string;
  slideLabel: string;
};

const AUTO_ADVANCE_MS = 5000;

/** Compact 30vh hero slider cycling through famous handloom saree traditions. */
export function SareeHeroSlider({ eyebrow, slides, prevLabel, nextLabel, slideLabel }: SareeHeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || paused || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduced, slides.length]);

  const active = slides[index] ?? slides[0];
  if (!active) return null;

  const prev = () => setIndex((current) => (current - 1 + slides.length) % slides.length);
  const next = () => setIndex((current) => (current + 1) % slides.length);

  return (
    <section
      aria-label={eyebrow}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative flex min-h-[30vh] items-end overflow-hidden border-b border-line bg-ink text-chalk"
    >
      <div className="page-gutter flex flex-col justify-between gap-6 py-6 md:flex-row md:items-end md:py-8">
        <div className="flex max-w-[64ch] flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="type-label text-selvedge">{eyebrow}</span>
            <span aria-hidden className="text-chalk/30">
              /
            </span>
            <span className="type-meta text-chalk/75">{active.origin}</span>
          </div>
          <h2 className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] leading-tight font-normal text-chalk">
            {active.name}
          </h2>
          <p className="text-[0.9375rem] leading-relaxed text-chalk/80">{active.details}</p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="flex items-center gap-1.5" role="tablist" aria-label={slideLabel}>
            {slides.map((slide, slideIndex) => {
              const selected = slideIndex === index;
              return (
                <button
                  key={slide.name}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`${slide.name} (${slideIndex + 1}/${slides.length})`}
                  onClick={() => setIndex(slideIndex)}
                  className={`h-1.5 transition-all ${
                    selected ? "w-6 bg-selvedge" : "w-2 bg-chalk/30 hover:bg-chalk/60"
                  }`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prev}
              aria-label={prevLabel}
              className="inline-flex size-9 items-center justify-center border border-chalk/25 text-chalk transition-colors hover:border-chalk hover:bg-chalk/10"
            >
              <FiChevronLeft aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={nextLabel}
              className="inline-flex size-9 items-center justify-center border border-chalk/25 text-chalk transition-colors hover:border-chalk hover:bg-chalk/10"
            >
              <FiChevronRight aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

