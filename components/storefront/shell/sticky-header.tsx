"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Scroll distance (px) over which the bar goes from full size to compact. */
const SHRINK_RANGE_PX = 140;
/** Share of the remaining distance covered each frame; lower is softer. */
const EASE = 0.14;

/**
 * The sticky header shell. It exposes `--p` (0 at the top, 1 when compact);
 * the bar and logo heights inside are calc() of it. `--p` follows the scroll
 * position but eases toward it frame by frame, so the bar glides instead of
 * jumping. Written straight to the DOM (no re-render); with reduced motion it
 * snaps to the target.
 */
export function StickyHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = 0;
    let frame = 0;
    const target = () => Math.min(1, Math.max(0, window.scrollY / SHRINK_RANGE_PX));
    const write = () => ref.current?.style.setProperty("--p", current.toFixed(4));
    const step = () => {
      frame = 0;
      const goal = target();
      current = reduced ? goal : current + (goal - current) * EASE;
      if (Math.abs(goal - current) < 0.002) current = goal;
      write();
      if (current !== goal) frame = requestAnimationFrame(step);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };
    current = target();
    write();
    window.addEventListener("scroll", kick, { passive: true });
    return () => {
      window.removeEventListener("scroll", kick);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    // The bottom margin gives back exactly what the bar loses (1rem / 2rem at lg), so the
    // page below never moves: no scroll-anchoring jumps and the home stitch never re-lays out.
    <header
      ref={ref}
      style={{ "--p": 0 } as React.CSSProperties}
      className="sticky top-0 z-40 mb-[calc(1rem*var(--p))] border-b border-ink/10 bg-chalk/90 backdrop-blur-md lg:mb-[calc(2rem*var(--p))]"
    >
      {children}
    </header>
  );
}
