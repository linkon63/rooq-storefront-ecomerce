"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { whenPageSettled } from "@/lib/storefront/when-settled";

type SliderLoop = {
  track: RefObject<HTMLUListElement | null>;
  tween: RefObject<gsap.core.Tween | null>;
  loop: boolean;
  count: number;
  seconds: number;
  onSlide: (index: number) => void;
};

/**
 * Runs the hero's seamless glide once the page has settled, and only while the
 * slider is visible. Sizes come from a ResizeObserver, so no frame reads layout.
 */
export function useSliderLoop({ track, tween, loop, count, seconds, onSlide }: SliderLoop) {
  useEffect(() => {
    const list = track.current;
    const frame = list?.parentElement;
    if (!loop || !list || !frame) return;
    let half = 0;
    let view = 0;
    let onScreen = true;
    let current = 0;
    const sync = () => tween.current?.paused(!onScreen || !half);

    const sizes = new ResizeObserver(() => {
      half = list.scrollWidth / 2;
      view = frame.clientWidth;
      sync();
    });
    const visible = new IntersectionObserver(([entry]) => {
      onScreen = Boolean(entry?.isIntersecting);
      sync();
    });
    const cancel = whenPageSettled(() => {
      tween.current = gsap.to(list, {
        xPercent: -50,
        duration: seconds,
        ease: "none",
        repeat: -1,
        onUpdate() {
          if (!half) return;
          const centre = this.progress() * half + view / 2;
          const next = Math.floor((centre % half) / (half / count)) % count;
          if (next !== current) onSlide((current = next));
        },
      });
      sizes.observe(list);
      sizes.observe(frame);
      visible.observe(frame);
    });

    return () => {
      cancel();
      sizes.disconnect();
      visible.disconnect();
      tween.current?.kill();
      tween.current = null;
      gsap.set(list, { clearProps: "transform" });
    };
  }, [track, tween, loop, count, seconds, onSlide]);
}
