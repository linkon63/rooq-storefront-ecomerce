"use client";

import { useRef, useState, type PointerEvent } from "react";
import type { Image } from "@/types/storefront/catalog";

const LENS_PX = 168;
const MAGNIFY = 2.4;

type Lens = { x: number; y: number; bgX: number; bgY: number; bgW: number; bgH: number };

/**
 * A round magnifier that follows the mouse over a gallery photo and shows the
 * weave close up. The photo is cropped like `object-cover`, so the lens maps
 * the pointer back to the photo's own pixels. Mouse only (touch keeps the tap
 * to zoom); the parent button handles clicks.
 */
export function FabricLens({ image }: { image: Image }) {
  const [lens, setLens] = useState<Lens | null>(null);
  const box = useRef<HTMLSpanElement>(null);
  const iw = image.width ?? 0;
  const ih = image.height ?? 0;
  if (!iw || !ih) return null;

  const move = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== "mouse" || !box.current) return;
    const rect = box.current.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const cover = Math.max(rect.width / iw, rect.height / ih);
    const offsetX = (rect.width - iw * cover) / 2;
    const offsetY = (rect.height - ih * cover) / 2;
    const scale = cover * MAGNIFY;
    setLens({
      x: px - LENS_PX / 2,
      y: py - LENS_PX / 2,
      bgW: iw * scale,
      bgH: ih * scale,
      bgX: LENS_PX / 2 - ((px - offsetX) / cover) * scale,
      bgY: LENS_PX / 2 - ((py - offsetY) / cover) * scale,
    });
  };

  return (
    <span ref={box} aria-hidden className="absolute inset-0 [@media(pointer:coarse)]:hidden" onPointerMove={move} onPointerLeave={() => setLens(null)}>
      {lens ? (
        <span
          className="pointer-events-none absolute left-0 top-0 rounded-full border-2 border-dashed border-paper shadow-[0_10px_30px_-8px_rgb(0_0_0/0.55)]"
          style={{
            width: LENS_PX,
            height: LENS_PX,
            transform: `translate(${lens.x}px, ${lens.y}px)`,
            backgroundImage: `url(${image.url})`,
            backgroundSize: `${lens.bgW}px ${lens.bgH}px`,
            backgroundPosition: `${lens.bgX}px ${lens.bgY}px`,
            backgroundRepeat: "no-repeat",
          }}
        />
      ) : null}
    </span>
  );
}
