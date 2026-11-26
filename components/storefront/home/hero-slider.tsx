"use client";

import gsap from "gsap";
import { useRef, useState } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import type { HeroSlide } from "@/types/storefront/content";
import { HeroProductCard } from "./hero-product-card";
import { HeroSlidePhoto } from "./hero-slide-photo";
import { useSliderLoop } from "./use-slider-loop";

const SECONDS_PER_SLIDE = 11;
const SIZES = "(min-width: 1024px) 30vw, 66vw";

type HeroSliderProps = {
  slides: HeroSlide[];
  labels: { play: string; pause: string };
  /** Media query where the parent hides the slider: its photos are not fetched there. */
  hiddenOn?: string;
};

/**
 * The hero's line-up: looks on white, one after another, gliding left in a
 * seamless loop (the list is rendered twice; the track moves by half its
 * width). The slide at the centre is "in focus"; when it is linked to a
 * product, that product's card shows in the bottom-right corner. Only the
 * button pauses the loop. With reduced motion it is a still row you scroll
 * by hand.
 */
export function HeroSlider({ slides, labels, hiddenOn }: HeroSliderProps) {
  const track = useRef<HTMLUListElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const dragged = useRef(false);
  const [active, setActive] = useState(0);
  const loop = !reduced && slides.length > 1;
  const items = loop ? [...slides, ...slides] : slides;
  const product = slides[active]?.product ?? null;

  useSliderLoop({ track, tween, loop, count: slides.length, seconds: slides.length * SECONDS_PER_SLIDE, onSlide: setActive });

  const toggle = () => {
    if (!tween.current) return;
    const next = !paused;
    setPaused(next);
    pausedRef.current = next;
    gsap.to(tween.current, { timeScale: next ? 0 : 1, duration: 0.6, ease: "power2.out" });
  };

  /** Drag the line-up either way; the loop holds while dragging and resumes on release. */
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const t = tween.current;
    const list = track.current;
    if (!t || !list || (event.pointerType === "mouse" && event.button !== 0)) return;
    const half = list.scrollWidth / 2;
    let lastX = event.clientX;
    dragged.current = false;
    gsap.killTweensOf(t);
    t.timeScale(0);
    const move = (e: PointerEvent) => {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      if (Math.abs(e.clientX - event.clientX) > 5) dragged.current = true;
      const progress = t.progress() - dx / half;
      t.progress(((progress % 1) + 1) % 1);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (!pausedRef.current) gsap.to(t, { timeScale: 1, duration: 0.6, ease: "power2.out" });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  return (
    <div className="relative bg-white">
      <div
        onPointerDown={loop ? onPointerDown : undefined}
        onClickCapture={(e) => {
          if (dragged.current) {
            e.preventDefault();
            e.stopPropagation();
            dragged.current = false;
          }
        }}
        className={loop ? "cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing [&_img]:pointer-events-none" : "rail-scroll overflow-x-auto"}
      >
        <ul ref={track} className="flex w-max">
          {items.map((slide, index) => {
            const copy = index >= slides.length;
            return (
              <li
                key={`${slide.id}-${index}`}
                aria-hidden={copy || undefined}
                className="relative aspect-3/4 h-[min(62svh,38rem)] shrink-0"
              >
                <HeroSlidePhoto slide={slide} copy={copy} eager={index < 3} sizes={SIZES} hiddenOn={hiddenOn} />
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
          aria-label={paused ? labels.play : labels.pause}
          className="absolute bottom-3 left-3 z-10 grid size-10 place-items-center rounded-full bg-chalk/90 text-ink ring-1 ring-ink/10 transition-colors hover:bg-ink hover:text-chalk lg:bottom-6 lg:left-6"
        >
          {paused ? <FiPlay aria-hidden className="size-4" /> : <FiPause aria-hidden className="size-4" />}
        </button>
      ) : null}
    </div>
  );
}
