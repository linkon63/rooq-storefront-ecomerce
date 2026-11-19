"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { FiX } from "react-icons/fi";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { GALLERY_MAX_PHOTOS } from "@/lib/constants/gallery";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/constants/media";

type GalleryPhotoPickerProps = { files: File[]; onChange: (files: File[]) => void; error?: string | null };

/** 1–3 required photos (5 MB each) with removable previews. */
export function GalleryPhotoPicker({ files, onChange, error }: GalleryPhotoPickerProps) {
  const [pickError, setPickError] = useState<string | null>(null);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (picked.some((file) => file.size > MAX_UPLOAD_BYTES)) return setPickError(ERROR_MESSAGES.upload.tooLarge(MAX_UPLOAD_MB));
    if (picked.some((file) => !ALLOWED_IMAGE_MIME_TYPES.includes(file.type))) return setPickError(ERROR_MESSAGES.upload.unsupportedType("JPEG, PNG, WebP, AVIF, GIF"));
    if (files.length + picked.length > GALLERY_MAX_PHOTOS) return setPickError(ERROR_MESSAGES.gallery.tooManyPhotos(GALLERY_MAX_PHOTOS));
    setPickError(null);
    onChange([...files, ...picked]);
  }

  const message = pickError ?? error;
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">
        Your photos <span aria-hidden className="text-red-600">*</span>
        <span className="font-normal text-stone"> (up to {GALLERY_MAX_PHOTOS})</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {previews.map((url, index) => (
          <div key={url} className="relative size-24 overflow-hidden bg-selvedge">
            {/* Local object URL previews cannot go through next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Photo ${index + 1}`} className="size-full object-cover" />
            <button type="button" onClick={() => onChange(files.filter((_, position) => position !== index))} aria-label={`Remove photo ${index + 1}`} className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-paper">
              <FiX aria-hidden className="size-3.5" />
            </button>
          </div>
        ))}
        {files.length < GALLERY_MAX_PHOTOS ? (
          <label className="grid size-24 cursor-pointer place-items-center border border-dashed border-stone text-2xl text-stone focus-within:outline-2 focus-within:outline-dye hover:border-ink hover:text-ink">
            <span aria-hidden>+</span>
            <span className="sr-only">Add photos</span>
            <input type="file" accept="image/*" multiple onChange={handleChange} className="sr-only" />
          </label>
        ) : null}
      </div>
      {message ? (
        <p role="alert" className="mt-2 text-sm text-dye-deep">
          {message}
        </p>
      ) : null}
    </div>
  );
}
