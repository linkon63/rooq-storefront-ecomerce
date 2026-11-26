"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/**
 * State of a one-slide-per-view scroll-snap track: which slide is showing
 * (follows native swiping) and how to move to another.
 */
export function useSnapSlider() {
  const track = useRef<HTMLUListElement>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);

  const goTo = (index: number) => {
    const list = track.current;
    const item = list?.children[index] as HTMLElement | undefined;
    if (!list || !item) return;
    list.scrollTo({ left: item.offsetLeft, behavior: reduced ? "auto" : "smooth" });
  };

  useEffect(() => {
    const list = track.current;
    if (!list) return;
    const onScroll = () => {
      const items = Array.from(list.children) as HTMLElement[];
      let nearest = 0;
      items.forEach((item, index) => {
        if (Math.abs(item.offsetLeft - list.scrollLeft) < Math.abs((items[nearest]?.offsetLeft ?? 0) - list.scrollLeft)) nearest = index;
      });
      setActive(nearest);
    };
    list.addEventListener("scroll", onScroll, { passive: true });
    return () => list.removeEventListener("scroll", onScroll);
  }, []);

  return { track, active, goTo, reduced };
}
