"use client";

import { useEffect, useRef, useState } from "react";
import { pickImages } from "@/lib/admin-image-upload";
import { resolveImageUrl } from "@/utils/admin/format";
import { AdminIcon, type AdminIconName } from "./admin-icons";
import { ImageSizeHint } from "./admin-ui";

type Props = {
  label: string;
  file: File | null;
  currentUrl: string | null;
  removed: boolean;
  disabled?: boolean;
  placeholderIcon?: AdminIconName;
  onPick: (file: File) => void;
  onRemove: () => void;
};

/** One-image picker with preview: a newly picked file, else the current image unless removed. */
export function ImagePickField({ label, file, currentUrl, removed, disabled, placeholderIcon = "image", onPick, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const preview = previewUrl ?? (removed || !currentUrl ? null : resolveImageUrl(currentUrl));

  return (
    <>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {label} <ImageSizeHint className="ml-1.5 align-middle" />
        </span>
        <input
          accept="image/*"
          className="block w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium outline-none transition-colors file:mr-4 file:rounded-lg file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300 focus:border-blue-500 focus:bg-white"
          onChange={(event) => {
            const [picked] = pickImages(event.target) ?? [];
            if (picked) onPick(picked);
          }}
          ref={inputRef}
          type="file"
        />
      </label>
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
        {preview ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- object URL / DB media preview */}
            <img alt={`${label} preview`} className="h-20 w-20 rounded-lg border border-slate-200 bg-white object-cover" height={80} src={preview} width={80} />
            <p className="min-w-0 flex-1 truncate text-sm text-slate-800">{file?.name ?? `Current ${label.toLowerCase()}`}</p>
            <button
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
              disabled={disabled}
              onClick={() => {
                if (inputRef.current) inputRef.current.value = "";
                onRemove();
              }}
              type="button"
            >
              <AdminIcon className="h-3.5 w-3.5" name="x" /> Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-slate-500">
            <span className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-white">
              <AdminIcon className="h-5 w-5" name={placeholderIcon} />
            </span>
            <p className="text-sm font-medium">No {label.toLowerCase()} selected.</p>
          </div>
        )}
      </div>
    </>
  );
}
