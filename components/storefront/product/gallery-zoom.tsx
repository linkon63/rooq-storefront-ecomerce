"use client";

import Image from "next/image";
import { useState, type PointerEvent } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { PositionedImage } from "@/types/storefront/catalog";
import { Modal } from "../shared/modal";

type GalleryZoomProps = {
  images: PositionedImage[];
  startIndex: number;
  altBase: string;
  onClose: () => void;
};

/**
 * Full-screen viewer. Tap/click toggles 2.2× zoom; while zoomed the image
 * pans with the pointer. Arrow buttons (and keys) step through images.
 */
export function GalleryZoom({ images, startIndex, altBase, onClose }: GalleryZoomProps) {
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const image = images[index];

  const step = (delta: number) => {
    setZoomed(false);
    setIndex((current) => (current + delta + images.length) % images.length);
  };

  const pan = (event: PointerEvent<HTMLButtonElement>) => {
    if (!zoomed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <Modal open onOpenChange={(open) => (open ? null : onClose())} title={`${altBase}, image ${index + 1} of ${images.length}`} hideTitle className="!max-w-5xl">
      <div
        className="relative bg-selvedge"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
      >
        <button
          type="button"
          onClick={() => setZoomed((value) => !value)}
          onPointerMove={pan}
          className={`relative block h-[75dvh] w-full overflow-hidden ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
          aria-label={zoomed ? "Zoom out" : "Zoom in"}
        >
          <Image
            src={image.url}
            alt={image.alt ?? `${altBase}, view ${index + 1}`}
            fill
            sizes="100vw"
            className="object-contain transition-transform duration-300"
            style={{ transform: zoomed ? "scale(2.2)" : "scale(1)", transformOrigin: origin }}
          />
        </button>
        {images.length > 1 ? (
          <>
            <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-paper">
              <FiChevronLeft aria-hidden className="size-5" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next image" className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-paper">
              <FiChevronRight aria-hidden className="size-5" />
            </button>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
