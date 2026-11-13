"use client";

import gsap from "gsap";
import { useEffect, type RefObject } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { setWhatsappHighlighted } from "@/lib/store/slices/ui-slice";
import { WHATSAPP_FAB_SELECTOR } from "@/components/storefront/shell/whatsapp-button";
import { runningMax, sampleIndexAtY } from "@/utils/storefront/stitch-path";

type StitchRefs = {
  box: RefObject<HTMLDivElement | null>;
  thread: RefObject<SVGPathElement | null>;
  reveal: RefObject<SVGPathElement | null>;
  needle: RefObject<SVGGElement | null>;
};

/** Where on screen the needle sews (share of the viewport height from the top). */
const NEEDLE_VIEWPORT_Y = 0.62;
const SAMPLE_PX = 12;
/** Within this many px of the end, the thread counts as finished. */
const END_PX = 6;

const degrees = (dx: number, dy: number) => (Math.atan2(dy, dx) * 180) / Math.PI;

/**
 * Scroll → stitch: the thread is revealed down to the point level with
 * NEEDLE_VIEWPORT_Y of the screen, and the needle sits there, turned along
 * the thread. The length eases (gsap.quickTo) so it sews rather than jumps.
 * Scrolling back up hides the needle and the stitches come out on their own.
 * At the end the needle turns to the WhatsApp button and the button is
 * flagged (Redux) to blink. Re-measures whenever `pathKey` (the d) changes.
 */
export function useStitchScroll({ box, thread, reveal, needle }: StitchRefs, pathKey: string) {
  const dispatch = useAppDispatch();

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
    // Always end on the exact end of the path, or the needle stops short and never "finishes".
    if ((lengths[lengths.length - 1] ?? 0) < total) {
      lengths.push(total);
      ys.push(path.getPointAtLength(total).y);
    }
    const reach = runningMax(ys);
    mask.style.strokeDasharray = `${total}`;

    let finished = false;
    const state = { length: 0 };
    const render = () => {
      mask.style.strokeDashoffset = `${total - state.length}`;
      const at = path.getPointAtLength(state.length);
      const done = state.length >= total - END_PX;
      let angle = degrees(...aheadOf(path, state.length, total, at));
      const fab = done ? document.querySelector(WHATSAPP_FAB_SELECTOR) : null;
      if (fab) {
        const [target, origin] = [fab.getBoundingClientRect(), container.getBoundingClientRect()];
        angle = degrees(target.left + target.width / 2 - origin.left - at.x, target.top + target.height / 2 - origin.top - at.y);
      }
      pin.setAttribute("transform", `translate(${at.x} ${at.y}) rotate(${Number.isFinite(angle) ? angle : 90})`);
      if (done !== finished) {
        finished = done;
        dispatch(setWhatsappHighlighted(done));
      }
    };
    const sewTo = gsap.quickTo(state, "length", { duration: 0.8, ease: "power3.out", onUpdate: render });

    /** Sewing down shows the needle; going back up hides it, and the thread is unpicked without it. */
    let sewing = true;
    const showNeedle = (show: boolean) => {
      if (show === sewing) return;
      sewing = show;
      gsap.to(pin, { autoAlpha: show ? 1 : 0, duration: show ? 0.25 : 0.2, ease: "power1.out", overwrite: true });
    };

    const onScroll = () => {
      const y = window.innerHeight * NEEDLE_VIEWPORT_Y - container.getBoundingClientRect().top;
      const target = y <= 0 ? 0 : (lengths[sampleIndexAtY(reach, y)] ?? total);
      if (target !== state.length) showNeedle(target > state.length);
      sewTo(target);
      if (finished) render();
    };
    render();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      gsap.killTweensOf([state, pin]);
      dispatch(setWhatsappHighlighted(false));
    };
  }, [box, thread, reveal, needle, pathKey, dispatch]);
}

/** Direction of travel at a length along the path, as [dx, dy]. */
function aheadOf(path: SVGPathElement, length: number, total: number, at: DOMPoint): [number, number] {
  const ahead = path.getPointAtLength(Math.min(total, length + 2));
  if (ahead.x === at.x && ahead.y === at.y) {
    const behind = path.getPointAtLength(Math.max(0, length - 2));
    return [at.x - behind.x, at.y - behind.y];
  }
  return [ahead.x - at.x, ahead.y - at.y];
}
