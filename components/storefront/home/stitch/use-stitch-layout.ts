"use client";

import { useEffect, useState, type RefObject } from "react";

/** How far above the bottom of the page the thread ends (share of the viewport), so the needle can reach it. */
const END_ABOVE_BOTTOM = 0.45;

export type StitchLayout = {
  width: number;
  height: number;
  /** Where the thread starts: the top of the hero (`<main>`), in line with the header logo. */
  startX: number;
  startY: number;
  /** Bottom of the hero: the thread runs straight down to here before the pattern starts. */
  heroBottom: number;
  /** Top of the footer: below it the thread changes colour. */
  footerY: number;
  /** Where the thread ends, inside the footer. */
  endY: number;
};

const EMPTY: StitchLayout = { width: 0, height: 0, startX: 0, startY: 0, heroBottom: 0, footerY: 0, endY: 0 };
const same = (a: StitchLayout, b: StitchLayout) => (Object.keys(a) as (keyof StitchLayout)[]).every((key) => a[key] === b[key]);

/**
 * Measures the storefront box the thread is drawn over (header to footer), in
 * its own coordinates, and re-measures as it changes size (images loading,
 * rails streaming in).
 */
export function useStitchLayout(box: RefObject<HTMLDivElement | null>): StitchLayout {
  const [layout, setLayout] = useState(EMPTY);

  useEffect(() => {
    const element = box.current;
    const root = element?.parentElement;
    if (!element || !root) return;
    const measure = () => {
      const main = root.querySelector<HTMLElement>("#main");
      const logo = root.querySelector<HTMLElement>("[data-stitch-origin]");
      const footer = root.querySelector<HTMLElement>("footer");
      const hero = root.querySelector<HTMLElement>("[data-stitch-hero]");
      const width = Math.round(element.offsetWidth);
      const height = Math.round(element.offsetHeight);
      const logoBox = logo?.getBoundingClientRect();
      const next: StitchLayout = {
        width,
        height,
        startX: logoBox ? Math.round(logoBox.left + logoBox.width / 2 - root.getBoundingClientRect().left) : Math.round(width / 2),
        startY: main?.offsetTop ?? 0,
        heroBottom: hero ? hero.offsetTop + hero.offsetHeight : (main?.offsetTop ?? 0),
        footerY: footer?.offsetTop ?? height,
        endY: Math.max(0, Math.round(height - window.innerHeight * END_ABOVE_BOTTOM)),
      };
      setLayout((prev) => (same(prev, next) ? prev : next));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, [box]);

  return layout;
}
