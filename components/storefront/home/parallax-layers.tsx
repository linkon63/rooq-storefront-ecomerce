"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Scroll depth for a section: every `[data-depth="n"]` inside drifts by n×100 %
 * of its own height while the section crosses the screen (positive = slower
 * than the page, negative = faster). Half the travel on phones; none with
 * reduced motion.
 */
export function ParallaxLayers({ children, className }: { children: ReactNode; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add(
        { wide: "(min-width: 768px) and (prefers-reduced-motion: no-preference)", narrow: "(max-width: 767px) and (prefers-reduced-motion: no-preference)" },
        (context) => {
          const scale = context.conditions?.wide ? 1 : 0.5;
          gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((layer) => {
            const depth = Number(layer.dataset.depth) * scale * 100;
            gsap.fromTo(
              layer,
              { yPercent: -depth },
              { yPercent: depth, ease: "none", scrollTrigger: { trigger: scope.current, start: "top bottom", end: "bottom top", scrub: true } },
            );
          });
        },
      );
      return () => media.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
