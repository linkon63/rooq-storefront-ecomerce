"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const UNROLL_SECONDS = 1.2;
const STAGGER_SECONDS = 0.12;

/**
 * Category tiles unroll like bolts of cloth: a fabric roll travels down each
 * `[data-bolt-tile]` and the tile (`[data-bolt]`) is revealed behind it.
 * Tiles already on screen when the page loads stay as they are (no flash);
 * reduced motion: nothing runs.
 */
export function BoltReveal({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const tiles = gsap.utils
          .toArray<HTMLElement>("[data-bolt-tile]")
          .filter((tile) => tile.getBoundingClientRect().top > window.innerHeight);
        if (tiles.length === 0) return;
        const parts = (tile: HTMLElement) => ({
          cloth: tile.querySelector<HTMLElement>("[data-bolt]"),
          roll: tile.querySelector<HTMLElement>("[data-bolt-roll]"),
        });
        tiles.forEach((tile) => {
          const { cloth, roll } = parts(tile);
          if (cloth) gsap.set(cloth, { clipPath: "inset(0% 0% 100% 0%)" });
          if (roll) gsap.set(roll, { y: 0, opacity: 1 });
        });
        ScrollTrigger.batch(tiles, {
          start: "top 88%",
          once: true,
          onEnter: (batch) => {
            const timeline = gsap.timeline({ defaults: { duration: UNROLL_SECONDS, ease: "power2.inOut" } });
            batch.forEach((element, index) => {
              const tile = element as HTMLElement;
              const { cloth, roll } = parts(tile);
              const at = index * STAGGER_SECONDS;
              if (cloth) timeline.to(cloth, { clipPath: "inset(0% 0% 0% 0%)" }, at);
              if (roll) {
                timeline
                  .to(roll, { y: tile.offsetHeight }, at)
                  .to(roll, { opacity: 0, duration: 0.25, ease: "none" }, at + UNROLL_SECONDS - 0.15);
              }
            });
          },
        });
      });
      return () => media.revert();
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
