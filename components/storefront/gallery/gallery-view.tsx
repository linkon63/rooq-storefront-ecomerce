"use client";

import { useMemo, useState } from "react";
import { StarRating } from "../shared/star-rating";
import { GalleryCard } from "./gallery-card";
import { GalleryLightbox } from "./gallery-lightbox";
import { averageGalleryRating } from "@/utils/storefront/gallery";
import { formatRating } from "@/utils/storefront/reviews";
import type { GallerySource, PublicGalleryEntry } from "@/types/gallery";

type Filter = GallerySource | "ALL";

const TABS: { source: Filter; label: string }[] = [
  { source: "ALL", label: "All" },
  { source: "FACEBOOK", label: "Facebook reviews" },
  { source: "WEBSITE", label: "Customer photos" },
];

/** Tabs, average rating, masonry grid and the zoom lightbox. */
export function GalleryView({ entries }: { entries: PublicGalleryEntry[] }) {
  const [source, setSource] = useState<Filter>("ALL");
  const [open, setOpen] = useState<{ entry: PublicGalleryEntry; index: number } | null>(null);
  // "All" leads with the Facebook reviews; each group stays newest first.
  const visible = useMemo(
    () =>
      source === "ALL"
        ? [...entries].sort((a, b) => Number(b.source === "FACEBOOK") - Number(a.source === "FACEBOOK"))
        : entries.filter((entry) => entry.source === source),
    [entries, source],
  );
  const average = useMemo(() => averageGalleryRating(entries), [entries]);

  return (
    <section aria-label="Customer gallery" className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Gallery type" className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.source}
              role="tab"
              type="button"
              aria-selected={source === tab.source}
              onClick={() => setSource(tab.source)}
              className={`type-label h-11 border px-5 ${source === tab.source ? "border-ink bg-ink text-chalk" : "border-line hover:border-ink"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {entries.length > 0 ? (
          <p className="flex items-center gap-2 text-sm text-stone">
            <StarRating rating={average} />
            <span>
              {formatRating(average)} average from {entries.length} {entries.length === 1 ? "review" : "reviews"}
            </span>
          </p>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <p className="border border-dashed border-line p-10 text-center text-stone">
          {entries.length === 0 ? "No photos yet. Be the first to share yours below." : "Nothing here yet."}
        </p>
      ) : (
        <ul role="tabpanel" className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {visible.map((entry) => (
            <li key={entry.id} className="mb-4 break-inside-avoid">
              <GalleryCard entry={entry} onZoom={(index) => setOpen({ entry, index })} />
            </li>
          ))}
        </ul>
      )}

      <GalleryLightbox open={open} onClose={() => setOpen(null)} />
    </section>
  );
}
