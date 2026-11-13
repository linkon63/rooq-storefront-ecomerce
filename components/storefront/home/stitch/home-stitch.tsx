"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/* The stitch (and GSAP) loads in the browser only. */
const StitchThread = dynamic(() => import("./stitch-thread"), { ssr: false });

/** Scroll-sewn thread over the home page; left out entirely for shoppers who asked for less motion. */
export function HomeStitch() {
  const reduceMotion = usePrefersReducedMotion();
  return reduceMotion ? null : <StitchThread />;
}
