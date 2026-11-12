"use client";

import { useEffect, useMemo } from "react";
import { AdminIcon } from "../../../../_components/admin-shell";
import { ImageSizeHint } from "../../../../_components/admin-ui";
import { pickImages } from "@/lib/admin-image-upload";
import { FieldLabel } from "../../_components/settings-ui";

type Props = {
  existing: string[];
  files: File[];
  onExistingChange: (urls: string[]) => void;
  onFilesChange: (files: File[]) => void;
};

function Thumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" className="h-20 w-full rounded-lg border border-slate-200 object-cover" src={src} />
      <button aria-label="Remove image" className="absolute -right-2 -top-2 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-red-500 text-white" onClick={onRemove} type="button">
        <AdminIcon className="h-3 w-3" name="x" />
      </button>
    </div>
  );
}

/** Saved images (kept by URL) plus newly picked files, with previews. */
export function CampaignImagesField({ existing, files, onExistingChange, onFilesChange }: Props) {
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  return (
    <div>
      <FieldLabel required>Campaign images</FieldLabel>
      <input
        accept="image/*"
        className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium"
        multiple
        onChange={(e) => onFilesChange([...files, ...(pickImages(e.target) ?? [])])}
        type="file"
      />
      <ImageSizeHint className="mt-2" />
      <div className="mt-3 grid grid-cols-4 gap-3">
        {existing.map((url, i) => (
          <Thumb key={url} onRemove={() => onExistingChange(existing.filter((_, j) => j !== i))} src={url} />
        ))}
        {previews.map((url, i) => (
          <Thumb key={url} onRemove={() => onFilesChange(files.filter((_, j) => j !== i))} src={url} />
        ))}
      </div>
      {files.length === 0 && existing.length === 0 && (
        <p className="mt-2 text-xs font-medium text-slate-400">At least one image is required.</p>
      )}
    </div>
  );
}
