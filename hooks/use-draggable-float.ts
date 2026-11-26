"use client";

import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";
import { readFloatPosition, saveFloatPosition, type FloatPosition } from "@/lib/storefront/float-position";

/** Finger travel below this is a tap, not a drag. */
const DRAG_AFTER_PX = 8;
/** Kept clear at the top so it never leaves the screen. */
const TOP_ROOM_PX = 160;

type Drag = { x: number; y: number; moved: boolean };

/**
 * Phones: drag the floating corner anywhere; it settles on the nearer edge and
 * stays there. CSS reads `--float-y` and `data-side`, and never lets it sit
 * under the bottom bars.
 */
export function useDraggableFloat() {
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const dragged = useRef(false);

  const place = ({ side, bottom }: FloatPosition) => {
    const node = box.current;
    if (!node) return;
    const clamped = Math.max(0, Math.min(bottom, window.innerHeight - TOP_ROOM_PX));
    node.dataset.side = side;
    node.style.setProperty("--float-y", `${clamped}px`);
  };

  useEffect(() => {
    const saved = readFloatPosition();
    if (saved) place(saved);
  }, []);

  const finish = (event: PointerEvent) => {
    const node = box.current;
    const current = drag.current;
    drag.current = null;
    if (!node || !current?.moved) return;
    const rect = node.getBoundingClientRect();
    const position: FloatPosition = {
      side: event.clientX < window.innerWidth / 2 ? "left" : "right",
      bottom: Math.round(window.innerHeight - rect.bottom),
    };
    node.style.translate = "";
    place(position);
    saveFloatPosition(position);
  };

  return {
    ref: box,
    onPointerDown: (event: PointerEvent) => {
      dragged.current = false;
      if (!window.matchMedia("(width < 48rem)").matches) return;
      // The speech bubble keeps its own taps.
      if ((event.target as Element).closest(".panda-bubble")) return;
      drag.current = { x: event.clientX, y: event.clientY, moved: false };
    },
    onPointerMove: (event: PointerEvent) => {
      const current = drag.current;
      if (!current || !box.current) return;
      const [dx, dy] = [event.clientX - current.x, event.clientY - current.y];
      if (!current.moved) {
        if (Math.hypot(dx, dy) < DRAG_AFTER_PX) return;
        current.moved = true;
        dragged.current = true;
        (event.target as Element).setPointerCapture(event.pointerId);
      }
      box.current.style.translate = `${dx}px ${dy}px`;
    },
    onPointerUp: finish,
    onPointerCancel: finish,
    /** The click that ends a drag must not open Tulo's bubble. */
    onClickCapture: (event: MouseEvent) => {
      if (!dragged.current) return;
      dragged.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}
