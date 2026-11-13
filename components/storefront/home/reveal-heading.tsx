"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * A chapter heading on the home page that slides in once as it enters the
 * viewport. Used on three headings only; everything else stays still.
 */
export function RevealHeading({ id, children }: { id: string; children: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(ref.current, {
          xPercent: -6,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
        });
      });
      return () => media.revert();
    },
    { scope: ref },
  );

  return (
    <h2 id={id} ref={ref} className="type-display text-[clamp(2.25rem,7vw,4.5rem)]">
      {children}
    </h2>
  );
}
