"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP);

/**
 * The page-load sequence: each headline line is woven in. Two copies of the
 * line, cut into alternate weft rows (`.weft-a` / `.weft-b`), slide in from
 * opposite sides and interlace into solid letters; then the calls to action
 * rise. Targets carry `.hero-reveal` (hidden by CSS until this runs) and
 * `.weft-done` (rows merged) except while weaving. Reduced motion: shown as is.
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
        const timeline = gsap.timeline({ defaults: { ease: "expo.out" } });
        lines.forEach((line, index) => {
          const at = index * 0.16;
          const rowsA = line.querySelector("[data-weft='a']");
          const rowsB = line.querySelector("[data-weft='b']");
          timeline
            .set(line, { opacity: 1, className: "hero-reveal relative block" }, at)
            .fromTo(rowsA, { xPercent: -14, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.3 }, at)
            .fromTo(rowsB, { xPercent: 14, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.3 }, at)
            .set(line, { className: "hero-reveal weft-done relative block" }, at + 1.3);
        });
        timeline.fromTo(after, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 }, "-=0.9");
      });
      return () => media.revert();
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
