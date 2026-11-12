"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP);

/**
 * The page-load sequence: headline lines rise out of their masks, then the
 * calls to action. Targets carry `.hero-reveal` (hidden by CSS until this
 * runs). With reduced motion they are simply shown.
 */
export function HeroIntro({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const lines = gsap.utils.toArray<HTMLElement>("[data-hero-line]");
      const after = gsap.utils.toArray<HTMLElement>("[data-hero-after]");
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([...lines, ...after], { opacity: 1, clearProps: "transform" });
      });
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .fromTo(lines, { yPercent: 108, opacity: 1 }, { yPercent: 0, duration: 0.9, stagger: 0.09 })
          .fromTo(after, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 }, "-=0.45");
      });
      return () => media.revert();
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
