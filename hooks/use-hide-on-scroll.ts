"use client";

import { useEffect, useState } from "react";

const THRESHOLD_PX = 8;
const ALWAYS_SHOW_BELOW_PX = 80;

/** True while the page is being scrolled down; false as soon as it goes back up. */
export function useHideOnScroll(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const next = window.scrollY;
      if (Math.abs(next - last) < THRESHOLD_PX) return;
      setHidden(next > last && next > ALWAYS_SHOW_BELOW_PX);
      last = next;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}
