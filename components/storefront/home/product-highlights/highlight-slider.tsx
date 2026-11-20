"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type HighlightSliderProps = {
  images: { url: string; alt: string }[];
  href: string;
  productName: string;
};

/**
 * Compact spotlight image slider: portrait frame with prev/next arrows,
 * touch swipe, and a slim vertical thumbnail rail (horizontal on mobile)
 * so all images are visible at a glance without adding vertical height.
 */
export function HighlightSlider({ images, href, productName }: HighlightSliderProps) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="p-3 sm:p-4 md:w-[42%] lg:w-[40%]">
        <Link href={href} aria-label={productName} className="block aspect-[4/5] max-h-[400px] w-full bg-selvedge" />
      </div>
    );
  }

  const count = images.length;
  const current = images[active] ?? images[0];
  const go = (next: number) => setActive(((next % count) + count) % count);

  return (
    <div className="flex flex-col gap-2.5 p-3 sm:p-4 md:w-[43%] md:shrink-0 md:flex-row lg:w-[41%] lg:p-5">
      <div
        className="group/slider relative aspect-[4/5] max-h-[380px] w-full flex-1 overflow-hidden bg-selvedge ring-1 ring-gold/30 md:max-h-[420px]"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          const end = e.changedTouches[0]?.clientX;
          touchStartX.current = null;
          if (start == null || end == null) return;
          const dx = end - start;
          if (Math.abs(dx) > 36) go(dx < 0 ? active + 1 : active - 1);
        }}
      >
        <Link href={href} aria-label={productName} className="block size-full">
          {images.map((image, index) => (
            <Image
              key={image.url}
              src={image.url}
              alt={index === 0 ? productName : image.alt || `${productName} view ${index + 1}`}
              fill
              sizes="(min-width: 768px) 32vw, 100vw"
              className={`object-cover transition-all duration-500 ease-(--ease-cloth) group-hover/slider:scale-[1.03] ${
                index === active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />
          ))}
        </Link>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink shadow-sm backdrop-blur-xs transition-opacity hover:bg-paper md:opacity-0 md:group-hover/slider:opacity-100"
            >
              <FiChevronLeft aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-ink shadow-sm backdrop-blur-xs transition-opacity hover:bg-paper md:opacity-0 md:group-hover/slider:opacity-100"
            >
              <FiChevronRight aria-hidden className="size-4" />
            </button>
            <span className="type-meta pointer-events-none absolute bottom-2 right-2 rounded-full bg-ink/80 px-2 py-0.5 text-chalk backdrop-blur-xs">
              {active + 1} / {count}
            </span>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div
          className="flex gap-2 overflow-x-auto pb-0.5 md:max-h-[420px] md:w-14 md:flex-col md:overflow-y-auto md:overflow-x-hidden md:pb-0"
          role="tablist"
          aria-label={`${productName} gallery`}
        >
          {images.map((image, index) => {
            const isCurrent = index === active;
            return (
              <button
                key={image.url}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-label={`View image ${index + 1} of ${count}`}
                onClick={() => setActive(index)}
                className={`relative aspect-[3/4] w-11 shrink-0 overflow-hidden bg-selvedge transition-all md:w-full ${
                  isCurrent ? "ring-2 ring-dye ring-offset-1" : "opacity-70 ring-1 ring-gold/30 hover:opacity-100"
                }`}
              >
                <Image src={image.url} alt="" fill sizes="56px" className="object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}

      <span className="sr-only">{current.alt}</span>
    </div>
  );
}
