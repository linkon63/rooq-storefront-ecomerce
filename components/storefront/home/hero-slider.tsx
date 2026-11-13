"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import type { HeroSlide } from "@/types/storefront/content";
import { HeroProductCard } from "./hero-product-card";

gsap.registerPlugin(useGSAP);

const SECONDS_PER_SLIDE = 11;
const SIZES = "(min-width: 1024px) 30vw, 66vw";

/**
 * The hero's line-up: looks on white, one after another, gliding left in a
 * seamless loop (the list is rendered twice; the track moves by half its
 * width). The slide at the centre is "in focus"; when it is linked to a
 * product, that product's card shows in the bottom-right corner. Only the
 * button pauses the loop. With reduced motion it is a still row you scroll
 * by hand.
 */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const track = useRef<HTMLUListElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);
  const loop = !reduced && slides.length > 1;
  const items = loop ? [...slides, ...slides] : slides;
  const product = slides[active]?.product ?? null;

  useGSAP(
    () => {
      const list = track.current;
      if (!loop || !list) return;
      const count = slides.length;
      tween.current = gsap.to(list, {
        xPercent: -50,
        duration: count * SECONDS_PER_SLIDE,
        ease: "none",
        repeat: -1,
        onUpdate() {
          const half = list.scrollWidth / 2;
          const centre = this.progress() * half + (list.parentElement?.clientWidth ?? 0) / 2;
          const next = Math.floor((centre % half) / (half / count)) % count;
          setActive((current) => (current === next ? current : next));
        },
      });
      return () => {
        tween.current?.kill();
        tween.current = null;
      };
    },
    { scope: track, dependencies: [loop, slides.length] },
  );

  const toggle = () => {
    if (!tween.current) return;
    const next = !paused;
    setPaused(next);
    gsap.to(tween.current, { timeScale: next ? 0 : 1, duration: 0.6, ease: "power2.out" });
  };

  return (
    <div className="relative bg-white">
      <div className={loop ? "overflow-hidden" : "rail-scroll overflow-x-auto"}>
        <ul ref={track} className="flex w-max">
          {items.map((slide, index) => {
            const copy = index >= slides.length;
            return (
              <li
                key={`${slide.id}-${index}`}
                aria-hidden={copy || undefined}
                className="relative aspect-3/4 h-[min(62svh,38rem)] shrink-0"
              >
                {(() => {
                  const photo = (
                    <Image
                      src={slide.image.url}
                      alt={copy ? "" : (slide.product?.name ?? slide.image.alt ?? "")}
                      fill
                      sizes={SIZES}
                      priority={index < 3}
                      className="object-contain"
                    />
                  );
                  return slide.product ? (
                    <Link
                      href={`/product/${slide.product.slug}`}
                      tabIndex={copy ? -1 : undefined}
                      aria-label={copy ? undefined : `View details: ${slide.product.name}`}
                      className="absolute inset-0 block"
                    >
                      {photo}
                    </Link>
                  ) : (
                    photo
                  );
                })()}
              </li>
            );
          })}
        </ul>
      </div>
      {product ? (
        <div className="absolute bottom-3 right-3 z-10 lg:bottom-6 lg:right-6">
          <HeroProductCard key={product.id} product={product} />
        </div>
      ) : null}
      {loop ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? "Play the slideshow" : "Pause the slideshow"}
          className="absolute bottom-3 left-3 z-10 grid size-10 place-items-center rounded-full bg-chalk/90 text-ink ring-1 ring-ink/10 transition-colors hover:bg-ink hover:text-chalk lg:bottom-6 lg:left-6"
        >
          {paused ? <FiPlay aria-hidden className="size-4" /> : <FiPause aria-hidden className="size-4" />}
        </button>
      ) : null}
    </div>
  );
}
