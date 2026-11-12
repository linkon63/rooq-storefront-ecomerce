"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { FIT_FEEDBACK_LABELS } from "@/lib/constants/storefront";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { postReview } from "@/lib/shop-api";
import type { FitFeedback } from "@/types/storefront/catalog";
import { errorText } from "@/utils/api-error";
import { FIT_SCALE } from "@/utils/storefront/reviews";
import { findVariant } from "@/utils/storefront/variant-selection";
import { PhotoPicker } from "./photo-picker";
import { RatingInput } from "./rating-input";
import type { ReviewProduct } from "./reviews-section";

type Props = {
  product: ReviewProduct;
  onClose: () => void;
  onPosted: () => void;
};

const fieldClass = "w-full rounded border border-line bg-paper px-3 py-2.5 text-base";

/** Multipart review: rating, fit, the size bought, text and up to five photos. */
export function ReviewForm({ product, onClose, onPosted }: Props) {
  const [rating, setRating] = useState(0);
  const [fit, setFit] = useState<FitFeedback | null>(null);
  const [colorId, setColorId] = useState(product.colors[0]?.id ?? "");
  const [sizeId, setSizeId] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating < 1) {
      setError(ERROR_MESSAGES.storefront.ratingRequired);
      return;
    }
    const form = new FormData();
    form.set("rating", String(rating));
    if (title.trim()) form.set("title", title.trim());
    if (comment.trim()) form.set("comment", comment.trim());
    if (fit) form.set("fitFeedback", fit);
    const variant = findVariant(product.variants, colorId || null, sizeId || null);
    if (variant) form.set("variantId", variant.id);
    for (const photo of photos) form.append("photos", photo);

    setSending(true);
    setError(null);
    try {
      await postReview(product.id, form);
      toast.success(SUCCESS_MESSAGES.storefront.reviewPosted);
      onPosted();
      onClose();
    } catch (caught) {
      setError(errorText(caught, ERROR_MESSAGES.storefront.reviewFailed));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5 rounded border border-line bg-paper p-4 md:p-6">
      <h3 className="font-wide text-lg font-bold">Review {product.name}</h3>
      <RatingInput value={rating} onChange={setRating} />
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">How did it fit?</legend>
        <div className="flex flex-wrap gap-2">
          {FIT_SCALE.map((value) => (
            <label key={value} className={`cursor-pointer rounded border px-3 py-2 text-sm ${fit === value ? "border-ink bg-ink text-chalk" : "border-line"}`}>
              <input type="radio" name="fit" value={value} checked={fit === value} onChange={() => setFit(value)} className="sr-only" />
              {FIT_FEEDBACK_LABELS[value]}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Colour you bought
          <select value={colorId} onChange={(event) => setColorId(event.target.value)} className={fieldClass}>
            {product.colors.map((color) => (
              <option key={color.id} value={color.id}>
                {color.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Size you bought
          <select value={sizeId} onChange={(event) => setSizeId(event.target.value)} className={fieldClass}>
            <option value="">Prefer not to say</option>
            {product.sizes.map((size) => (
              <option key={size.id} value={size.id}>
                {size.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Headline
        <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Your review
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} maxLength={2000} className={fieldClass} />
      </label>
      <PhotoPicker files={photos} onChange={setPhotos} />
      {error ? (
        <p role="alert" className="text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
      <div className="flex gap-3">
        <button type="submit" disabled={sending} className="h-11 rounded bg-ink px-6 text-sm font-semibold text-chalk hover:bg-ink-soft disabled:opacity-60">
          Post review
        </button>
        <button type="button" onClick={onClose} className="h-11 rounded px-4 text-sm font-semibold hover:bg-chalk">
          Cancel
        </button>
      </div>
    </form>
  );
}
