"use client";

import gsap from "gsap";
import { useEffect, type RefObject } from "react";
import { sampleIndexAtY } from "@/utils/storefront/stitch-path";

type StitchRefs = {
  box: RefObject<HTMLDivElement | null>;
  thread: RefObject<SVGPathElement | null>;
  reveal: RefObject<SVGPathElement | null>;
  needle: RefObject<SVGGElement | null>;
};

/** Where on screen the needle sews (share of the viewport height from the top). */
const NEEDLE_VIEWPORT_Y = 0.62;
const SAMPLE_PX = 16;

/**
 * Scroll → stitch: the thread is revealed down to the point level with
 * NEEDLE_VIEWPORT_Y of the screen, and the needle sits there, turned along
 * the thread. The length eases (gsap.quickTo) so it sews rather than jumps.
 * Re-measures whenever `pathKey` (the path's d) changes.
 */
export function useStitchScroll({ box, thread, reveal, needle }: StitchRefs, pathKey: string) {
  useEffect(() => {
    const [container, path, mask, pin] = [box.current, thread.current, reveal.current, needle.current];
    if (!container || !path || !mask || !pin || !pathKey) return;

    const total = path.getTotalLength();
    const lengths: number[] = [];
    const ys: number[] = [];
    for (let length = 0; length <= total; length += SAMPLE_PX) {
      lengths.push(length);
      ys.push(path.getPointAtLength(length).y);
    }
    mask.style.strokeDasharray = `${total}`;

    const state = { length: 0 };
    const render = () => {
      mask.style.strokeDashoffset = `${total - state.length}`;
      const at = path.getPointAtLength(state.length);
      const ahead = path.getPointAtLength(Math.min(total, state.length + 2));
      const angle = (Math.atan2(ahead.y - at.y, ahead.x - at.x) * 180) / Math.PI;
      pin.setAttribute("transform", `translate(${at.x} ${at.y}) rotate(${Number.isFinite(angle) ? angle : 90})`);
    };
    const sewTo = gsap.quickTo(state, "length", { duration: 0.7, ease: "power3.out", onUpdate: render });

    const onScroll = () => {
      const y = window.innerHeight * NEEDLE_VIEWPORT_Y - container.getBoundingClientRect().top;
      sewTo(y <= 0 ? 0 : (lengths[sampleIndexAtY(ys, y)] ?? total));
    };
    render();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      gsap.killTweensOf(state);
    };
  }, [box, thread, reveal, needle, pathKey]);
}
