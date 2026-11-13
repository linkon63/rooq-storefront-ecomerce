"use client";

import { useEffect, useRef, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SHOW_AFTER_PX = 480;

/**
 * Back-to-top button whose ring fills as the page is read. One passive scroll
 * listener, throttled to animation frames; the ring is written straight to
 * the DOM so scrolling never re-renders React.
 */
export function ScrollTopButton() {
  const ring = useRef<SVGCircleElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      ring.current?.setAttribute("stroke-dashoffset", String(CIRCUMFERENCE * (1 - ratio)));
      setVisible((current) => (current === window.scrollY > SHOW_AFTER_PX ? current : !current));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      className={`relative grid size-12 place-items-center rounded-full bg-chalk text-ink shadow-sheet transition-opacity duration-300 ease-(--ease-quiet) ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 size-12 -rotate-90">
        <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
        <circle ref={ring} cx="24" cy="24" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE} strokeLinecap="round" />
      </svg>
      <FiArrowUp aria-hidden className="relative size-4" />
    </button>
  );
}
