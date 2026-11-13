"use client";

import { useState } from "react";
import { IMAGE_SIZE_HINT, pickImages } from "@/lib/admin-image-upload";
import { ProductLinkField, type LinkedProduct } from "./product-link-field";

type Props = { busy: boolean; onUpload: (files: File[], productId: string | null) => Promise<void> };

/** Pick one or more images; with a single image a product can be linked straight away. */
export function UploadCard({ busy, onUpload }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [product, setProduct] = useState<LinkedProduct | null>(null);
  const [inputKey, setInputKey] = useState(0);

  async function submit() {
    if (files.length === 0) return;
    await onUpload(files, files.length === 1 ? (product?.id ?? null) : null);
    setFiles([]);
    setProduct(null);
    setInputKey((key) => key + 1);
  }

  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-slate-300 p-4">
      <input
        key={inputKey}
        type="file"
        accept="image/*"
        multiple
        disabled={busy}
        onChange={(e) => setFiles(pickImages(e.currentTarget) ?? [])}
        className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <p className="text-xs font-medium text-slate-500">
        Portrait 3:4 (for example 1200 × 1600 px) with the person on a plain white background, so every slide lines up. {IMAGE_SIZE_HINT}. New slides go to the end.
      </p>
      {files.length === 1 ? <ProductLinkField disabled={busy} value={product} onChange={setProduct} /> : null}
      {files.length > 1 ? <p className="text-xs text-slate-500">{files.length} images: link products on each slide after upload.</p> : null}
      <button
        type="button"
        disabled={busy || files.length === 0}
        onClick={() => void submit()}
        className="h-10 w-fit rounded-lg bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700 disabled:bg-blue-300"
      >
        {busy ? "Uploading…" : files.length > 1 ? `Add ${files.length} slides` : "Add slide"}
      </button>
    </div>
  );
}
