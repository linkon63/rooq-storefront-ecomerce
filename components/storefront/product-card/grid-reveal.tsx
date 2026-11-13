"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Product grid wrapper. Cards already on screen are left alone (no flash);
 * cards below the fold fade in, in batches, as they scroll into view.
 * Opacity only, on the quiet easing. Reduced motion: nothing runs.
 */
export function GridReveal({ children, className }: { children: ReactNode; className?: string }) {
  const list = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const below = gsap.utils
          .toArray<HTMLElement>("[data-grid-item]")
          .filter((item) => item.getBoundingClientRect().top > window.innerHeight);
        if (below.length === 0) return;
        gsap.set(below, { opacity: 0 });
        ScrollTrigger.batch(below, {
          start: "top 94%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, duration: 0.6, ease: "power1.out", stagger: 0.06, overwrite: true }),
        });
      });
      return () => media.revert();
    },
    { scope: list },
  );

  return (
    <ul ref={list} className={className}>
      {children}
    </ul>
  );
}
