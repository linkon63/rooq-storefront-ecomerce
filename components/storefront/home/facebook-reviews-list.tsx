"use client";

import { useState } from "react";
import { GalleryCard } from "../gallery/gallery-card";
import { GalleryLightbox } from "../gallery/gallery-lightbox";
import type { PublicGalleryEntry } from "@/types/gallery";

/** Review cards: a swipeable row on phones, a grid from `sm` up; tapping a screenshot zooms it. */
export function FacebookReviewsList({ entries }: { entries: PublicGalleryEntry[] }) {
  const [open, setOpen] = useState<{ entry: PublicGalleryEntry; index: number } | null>(null);
  return (
    <>
      <ul className="flex snap-x snap-mandatory items-start gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
        {entries.map((entry) => (
          <li key={entry.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
            <GalleryCard compact entry={entry} onZoom={(index) => setOpen({ entry, index })} />
          </li>
        ))}
      </ul>
      <GalleryLightbox open={open} onClose={() => setOpen(null)} />
    </>
  );
}
