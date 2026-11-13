"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/* The stitch (and GSAP) loads in the browser only. */
const StitchThread = dynamic(() => import("./stitch-thread"), { ssr: false });

/**
 * Scroll-sewn thread over the home page and its footer (rendered by the
 * storefront layout, shown on "/" only); left out entirely for shoppers who
 * asked for less motion.
 */
export function HomeStitch() {
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();
  return pathname === "/" && !reduceMotion ? <StitchThread key={pathname} /> : null;
}
