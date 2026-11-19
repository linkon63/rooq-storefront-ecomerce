"use client";

import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { COLOUR_RIPPLE_EVENT, type ColourRippleDetail } from "./colour-ripple";

/** How much of the dye tints the ground the photos pour over. */
const tint = (hex: string) => `color-mix(in oklab, ${hex} 26%, var(--color-chalk))`;

/**
 * Colour change ripple: after the shopper picks a colour, the new photos
 * are revealed by a circle that spreads from the chosen swatch, over a wash
 * of that dye. `colourId` is the trigger; the swatch announces itself first
 * (colour-ripple.ts). Reduced motion or no announcement: nothing runs.
 */
export function useColourRipple(box: RefObject<HTMLElement | null>, colourId: string | null) {
  const pending = useRef<ColourRippleDetail | null>(null);
  const first = useRef(true);

  useEffect(() => {
    const onPick = (event: Event) => {
      pending.current = (event as CustomEvent<ColourRippleDetail>).detail;
    };
    window.addEventListener(COLOUR_RIPPLE_EVENT, onPick);
    return () => window.removeEventListener(COLOUR_RIPPLE_EVENT, onPick);
  }, []);

  useLayoutEffect(() => {
    const element = box.current;
    const origin = pending.current;
    pending.current = null;
    if (first.current) {
      first.current = false;
      return;
    }
    if (!element || !origin || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = element.getBoundingClientRect();
    const x = origin.x - rect.left;
    const y = origin.y - rect.top;
    const reach = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
    gsap.killTweensOf(element);
    gsap.set(element, { backgroundColor: tint(origin.hex), clipPath: `circle(0px at ${x}px ${y}px)` });
    gsap.to(element, {
      clipPath: `circle(${reach}px at ${x}px ${y}px)`,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => gsap.set(element, { clearProps: "clipPath,backgroundColor" }),
    });
    return () => gsap.killTweensOf(element);
  }, [box, colourId]);
}
