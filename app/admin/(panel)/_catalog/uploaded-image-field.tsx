"use client";

import { useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { errorText } from "@/utils/error-text";
import { Button } from "./button";
import { ImageInput } from "./image-input";

/** Upload one image (POST /upload) and keep its /api/v1/media url. */
export function UploadedImageField({ label, url, onChange }: { label: string; url: string | null; onChange: (url: string | null) => void }) {
  const [uploading, setUploading] = useState(false);

  async function upload(files: File[]) {
    setUploading(true);
    try {
      onChange((await catalogApi.uploadImage(files[0])).url);
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.upload.failed));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-24 w-20 rounded-lg object-cover ring-1 ring-slate-200" />
      ) : (
        <span className="grid h-24 w-20 place-items-center rounded-lg bg-slate-100 text-xs text-slate-400">No image</span>
      )}
      <div className="grid gap-2">
        <ImageInput label={uploading ? "Uploading…" : label} disabled={uploading} onFiles={upload} />
        {url ? <Button tone="ghost" className="h-8 justify-self-start" onClick={() => onChange(null)}>Remove image</Button> : null}
      </div>
    </div>
  );
}
