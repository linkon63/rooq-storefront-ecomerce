"use client";

/* eslint-disable @next/next/no-img-element -- admin preview of an already-processed media URL */
import type { AdminHeroPhoto } from "@/types/admin/hero";

type Props = {
  photos: AdminHeroPhoto[];
  selectedId: string | null;
  busy: boolean;
  onSelect: (mediaId: string | null) => void;
};

/** The product's own photos as thumbnails; the first is its main image (chosen when nothing else is). */
export function MobilePhotoPicker({ photos, selectedId, busy, onSelect }: Props) {
  if (photos.length === 0) return <p className="text-xs font-semibold text-amber-700">This product has no photos yet.</p>;
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Photo shown on phones">
      {photos.map((photo, index) => {
        const checked = selectedId ? photo.id === selectedId : index === 0;
        return (
          <button
            key={photo.id}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={index === 0 ? "Main image" : `Photo ${index + 1}`}
            disabled={busy}
            onClick={() => !checked && onSelect(index === 0 ? null : photo.id)}
            className={`h-16 w-12 overflow-hidden rounded-md border-2 bg-slate-50 transition disabled:opacity-50 ${checked ? "border-blue-600" : "border-transparent hover:border-slate-300"}`}
          >
            <img alt="" className="h-full w-full object-cover" src={photo.url} />
          </button>
        );
      })}
    </div>
  );
}
