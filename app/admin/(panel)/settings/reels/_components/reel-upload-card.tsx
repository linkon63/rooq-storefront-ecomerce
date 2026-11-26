"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { MAX_REEL_BYTES, MAX_REEL_MB, REEL_MIME } from "@/lib/constants/reels";
import { ProductLinkField, type LinkedProduct } from "../../hero-slider/_components/product-link-field";

type Props = { busy: boolean; onUpload: (video: File, productId: string) => Promise<boolean> };

/** Pick a product and an MP4, then add them as a new reel. */
export function ReelUploadCard({ busy, onUpload }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<LinkedProduct | null>(null);

  async function submit() {
    const video = input.current?.files?.[0];
    if (!video) return toast.error(ERROR_MESSAGES.reel.videoRequired);
    if (!product) return toast.error(ERROR_MESSAGES.reel.productRequired);
    if (video.size > MAX_REEL_BYTES) return toast.error(ERROR_MESSAGES.reel.tooLarge(MAX_REEL_MB));
    if (await onUpload(video, product.id)) {
      setProduct(null);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-slate-300 p-4 md:max-w-md">
      <label className="grid gap-1 text-sm font-bold text-slate-700">
        Video (MP4, vertical 9:16, up to {MAX_REEL_MB} MB)
        <input ref={input} type="file" accept={REEL_MIME} disabled={busy} className="text-sm font-medium" />
      </label>
      <ProductLinkField value={product} disabled={busy} onChange={setProduct} />
      <button type="button" onClick={() => void submit()} disabled={busy} className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-bold text-white disabled:opacity-40">
        {busy ? "Saving…" : "Add reel"}
      </button>
    </div>
  );
}
