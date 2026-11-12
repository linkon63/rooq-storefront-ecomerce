"use client";

import { useEffect, useRef, useState } from "react";
import { AdminIcon } from "../../../_components/admin-shell";
import { ImageSizeHint } from "../../../_components/admin-ui";
import { pickImages } from "@/lib/admin-image-upload";

type Props = {
  file: File | null;
  currentUrl: string | null;
  disabled: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
};

/** Cover picker with a preview of the picked file, or of the saved cover. */
export function NewsCoverField({ file, currentUrl, disabled, onPick, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview ?? currentUrl;

  function remove() {
    if (inputRef.current) inputRef.current.value = "";
    onRemove();
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          Cover image <ImageSizeHint className="ml-1.5 align-middle" />
        </span>
        <input
          accept="image/*"
          className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium"
          onChange={(event) => {
            const [picked] = pickImages(event.target) ?? [];
            if (picked) onPick(picked);
          }}
          ref={inputRef}
          type="file"
        />
      </label>
      {shown && (
        <div className="flex items-center gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Cover preview" className="h-20 w-28 rounded-lg border border-slate-200 bg-white object-cover" src={shown} />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{file?.name ?? "Current cover"}</p>
          <button
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-700 hover:bg-red-100"
            disabled={disabled}
            onClick={remove}
            type="button"
          >
            <AdminIcon className="h-4 w-4" name="x" />
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
