"use client";

import { useEffect, useMemo } from "react";
import { GALLERY_MAX_PHOTOS } from "@/lib/constants/gallery";
import type { GalleryImage } from "@/types/gallery";

type Props = {
  existing: GalleryImage[];
  files: File[];
  onExistingChange: (images: GalleryImage[]) => void;
  onFilesChange: (files: File[]) => void;
};

const THUMB = "relative size-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-100";
const REMOVE = "absolute right-1 top-1 grid size-5 cursor-pointer place-items-center rounded-full bg-black/70 text-xs text-white";

/** Current photos (removable) plus newly chosen files, 1–3 in total. */
export function GalleryPhotoField({ existing, files, onExistingChange, onFilesChange }: Props) {
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);
  const room = GALLERY_MAX_PHOTOS - existing.length;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {existing.map((image) => (
          <div className={THUMB} key={image.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={image.alt ?? ""} className="size-full object-cover" src={image.url} />
            <button aria-label="Remove photo" className={REMOVE} onClick={() => onExistingChange(existing.filter((row) => row.id !== image.id))} type="button">
              ×
            </button>
          </div>
        ))}
        {previews.map((url, index) => (
          <div className={THUMB} key={url}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" className="size-full object-cover" src={url} />
            <button aria-label="Remove new photo" className={REMOVE} onClick={() => onFilesChange(files.filter((_, i) => i !== index))} type="button">
              ×
            </button>
          </div>
        ))}
      </div>
      {room > files.length && (
        <input
          accept="image/*"
          className="block w-full text-sm"
          multiple
          onChange={(event) => {
            onFilesChange([...files, ...Array.from(event.target.files ?? [])].slice(0, room));
            event.target.value = "";
          }}
          type="file"
        />
      )}
    </div>
  );
}
