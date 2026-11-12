"use client";

import { useRef } from "react";
import { AdminIcon } from "../../../../_components/admin-shell";
import { pickImages } from "@/lib/admin-image-upload";

/** One brand image: preview with a remove button, or an empty picker. */
export function LogoSlot({
  label,
  hint,
  url,
  onPick,
  onRemove,
}: {
  label: string;
  hint: string;
  url: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const box = "relative flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 transition";

  return (
    <div className="flex flex-col items-center gap-2">
      {url ? (
        <div className={box}>
          {/* Blob previews and media URLs alike — next/image cannot optimise blob: URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={label} className="h-full w-full object-contain p-2" src={url} />
          <button
            aria-label={`Remove ${label}`}
            className="absolute right-1.5 top-1.5 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
            onClick={() => {
              onRemove();
              if (inputRef.current) inputRef.current.value = "";
            }}
            type="button"
          >
            <AdminIcon className="h-3 w-3" name="x" />
          </button>
        </div>
      ) : (
        <button aria-label={`Upload ${label}`} className={`${box} cursor-pointer hover:border-slate-400 hover:bg-slate-100`} onClick={() => inputRef.current?.click()} type="button">
          <AdminIcon className="h-8 w-8 text-slate-300" name="plus" />
        </button>
      )}
      <p className="text-xs font-black text-slate-600" title={hint}>
        {label}
      </p>
      <input
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(event) => {
          const [file] = pickImages(event.target) ?? [];
          if (file) onPick(file);
        }}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}
