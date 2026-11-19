"use client";

import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Modal } from "../shared/modal";
import type { PublicGalleryEntry } from "@/types/gallery";

type LightboxState = { entry: PublicGalleryEntry; index: number } | null;

/** Full-size viewer. Radix handles focus trap, Esc and scroll lock. */
export function GalleryLightbox({ open, onClose }: { open: LightboxState; onClose: () => void }) {
  const [offset, setOffset] = useState(0);
  const entry = open?.entry;
  const count = entry?.images.length ?? 0;
  const current = open ? (open.index + offset + count * 10) % Math.max(count, 1) : 0;
  const image = entry?.images[current];

  function handleOpenChange(next: boolean) {
    if (next) return;
    setOffset(0);
    onClose();
  }

  return (
    <Modal open={open !== null} onOpenChange={handleOpenChange} title={entry ? `Photo by ${entry.name}` : "Photo"} hideTitle placement="center" className="max-w-4xl">
      {entry && image ? (
        <div className="relative bg-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.alt ?? `Photo by ${entry.name}`} className="mx-auto max-h-[75dvh] w-auto max-w-full object-contain" />
          {count > 1 ? (
            <>
              <button type="button" aria-label="Previous photo" onClick={() => setOffset((value) => value - 1)} className="absolute left-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center bg-paper/90">
                <FiChevronLeft aria-hidden className="size-5" />
              </button>
              <button type="button" aria-label="Next photo" onClick={() => setOffset((value) => value + 1)} className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center bg-paper/90">
                <FiChevronRight aria-hidden className="size-5" />
              </button>
            </>
          ) : null}
          <p className="bg-paper p-4 text-sm">
            <strong>{entry.name}</strong>
            {entry.city ? `, ${entry.city}` : ""} — {entry.feedback}
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
