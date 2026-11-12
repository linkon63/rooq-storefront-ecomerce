"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { FiX } from "react-icons/fi";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/constants/media";
import { REVIEW_PHOTO_MAX } from "@/lib/constants/storefront";

/** Up to five photos (5 MB each, images only) with removable previews. */
export function PhotoPicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const [error, setError] = useState<string | null>(null);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    const tooBig = picked.find((file) => file.size > MAX_UPLOAD_BYTES);
    const wrongType = picked.find((file) => !ALLOWED_IMAGE_MIME_TYPES.includes(file.type));
    if (tooBig) return setError(ERROR_MESSAGES.upload.tooLarge(MAX_UPLOAD_MB));
    if (wrongType) return setError(ERROR_MESSAGES.upload.unsupportedType("JPEG, PNG, WebP, AVIF, GIF"));
    if (files.length + picked.length > REVIEW_PHOTO_MAX) return setError(ERROR_MESSAGES.review.tooManyPhotos(REVIEW_PHOTO_MAX));
    setError(null);
    onChange([...files, ...picked]);
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold">Photos (optional, up to {REVIEW_PHOTO_MAX})</p>
      <div className="flex flex-wrap gap-2">
        {previews.map((url, index) => (
          <div key={url} className="relative size-20 overflow-hidden rounded-sm bg-selvedge">
            {/* Local object URL previews cannot go through next/image. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Photo ${index + 1}`} className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(files.filter((_, position) => position !== index))}
              aria-label={`Remove photo ${index + 1}`}
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-paper"
            >
              <FiX aria-hidden className="size-3.5" />
            </button>
          </div>
        ))}
        {files.length < REVIEW_PHOTO_MAX ? (
          <label className="grid size-20 cursor-pointer place-items-center rounded-sm border border-dashed border-stone text-2xl text-stone hover:border-ink hover:text-ink">
            <span aria-hidden>+</span>
            <span className="sr-only">Add photos</span>
            <input type="file" accept="image/*" multiple onChange={handleChange} className="sr-only" />
          </label>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}
