"use client";

import { useRef, type PointerEvent } from "react";

const CLOSE_AFTER_PX = 90;

/** Drag a bottom sheet down by its handle; far enough closes it, otherwise it springs back. */
export function useSheetDrag(onClose: () => void) {
  const panel = useRef<HTMLDivElement>(null);
  const start = useRef<number | null>(null);

  const offset = (event: PointerEvent) => Math.max(0, event.clientY - (start.current ?? event.clientY));
  const move = (px: number) => {
    if (panel.current) panel.current.style.translate = px ? `0 ${px}px` : "";
  };

  const handle = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      start.current = event.clientY;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event: PointerEvent) => {
      if (start.current !== null) move(offset(event));
    },
    onPointerUp: (event: PointerEvent) => {
      if (start.current === null) return;
      const travelled = offset(event);
      start.current = null;
      if (travelled > CLOSE_AFTER_PX) onClose();
      else move(0);
    },
    onPointerCancel: () => {
      start.current = null;
      move(0);
    },
  };

  return { panel, handle };
}
