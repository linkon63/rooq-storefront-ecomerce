"use client";

import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

type Point = { x: number; y: number };

const MOVE_SECONDS = 0.65;
const ENTER_SECONDS = 0.45;
const MIN_TRAVEL_PX = 2;

/**
 * Filter shuffle: when the grid re-renders with a different set of cards
 * (`[data-flip-id]` children, keyed by product), cards that stay slide from
 * their old spot to the new one and cards that are new fade in, instead of
 * the grid snapping. Positions are kept in page coordinates, so a scroll in
 * between does not matter; a resize forgets them. The first render, a page
 * change (nothing stays) and reduced motion are left alone.
 */
export function useGridFlip(list: RefObject<HTMLElement | null>) {
  const previous = useRef<Map<string, Point>>(new Map());

  useEffect(() => {
    const forget = () => previous.current.clear();
    window.addEventListener("resize", forget);
    return () => window.removeEventListener("resize", forget);
  }, []);

  useLayoutEffect(() => {
    const root = list.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-flip-id]"));
    gsap.killTweensOf(items);
    gsap.set(items, { clearProps: "transform" });

    const next = new Map<string, Point>();
    const moved: { el: HTMLElement; dx: number; dy: number }[] = [];
    const entered: HTMLElement[] = [];
    let stayed = 0;
    for (const el of items) {
      const id = el.dataset.flipId;
      if (!id) continue;
      const box = el.getBoundingClientRect();
      const at = { x: box.left + window.scrollX, y: box.top + window.scrollY };
      next.set(id, at);
      const before = previous.current.get(id);
      if (before) {
        stayed += 1;
        const dx = before.x - at.x;
        const dy = before.y - at.y;
        if (Math.abs(dx) > MIN_TRAVEL_PX || Math.abs(dy) > MIN_TRAVEL_PX) moved.push({ el, dx, dy });
      } else {
        entered.push(el);
      }
    }
    const hadCards = previous.current.size > 0;
    previous.current = next;
    if (!hadCards || stayed === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    moved.forEach(({ el, dx, dy }, index) => {
      gsap.fromTo(el, { x: dx, y: dy }, { x: 0, y: 0, duration: MOVE_SECONDS, ease: "power3.inOut", delay: Math.min(index * 0.012, 0.2) });
    });
    if (entered.length > 0) gsap.fromTo(entered, { opacity: 0 }, { opacity: 1, duration: ENTER_SECONDS, ease: "power1.out", delay: 0.2 });
  });
}
