"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { RatingInput } from "../reviews/rating-input";
import { TextField } from "../shared/text-field";
import { GalleryPhotoPicker } from "./gallery-photo-picker";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { GALLERY_MAX_CITY, GALLERY_MAX_FEEDBACK, GALLERY_MAX_NAME } from "@/lib/constants/gallery";
import { compressImage } from "@/lib/compress-image";
import { submitGalleryEntry } from "@/lib/storefront/gallery-api";

const m = ERROR_MESSAGES.gallery;

/** "Share your photo" form: photos, name, rating, feedback and a required consent. */
export function GalleryShareForm() {
  const [files, setFiles] = useState<File[]>([]);
  const [rating, setRating] = useState(0);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const feedback = String(data.get("feedback") ?? "").trim();
    const found: Record<string, string> = {};
    if (files.length === 0) found.photo = m.photoRequired;
    if (!name) found.name = m.nameRequired;
    if (rating < 1) found.rating = m.ratingInvalid;
    if (!feedback) found.feedback = m.feedbackRequired;
    if (!consent) found.consent = m.consentRequired;
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const body = new FormData();
    for (const [key, value] of data.entries()) if (typeof value === "string" && key !== "consent") body.append(key, value);
    body.set("rating", String(rating));
    body.set("consent", "true");
    setBusy(true);
    try {
      for (const file of files) body.append("photo", await compressImage(file));
      await submitGalleryEntry(body);
      setDone(true);
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : m.submitFailed);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section id="share" className="bg-selvedge/40 p-6 md:p-10" aria-live="polite">
        <p className="type-h3">{SUCCESS_MESSAGES.gallery.submitted}</p>
      </section>
    );
  }

  return (
    <section id="share" aria-labelledby="share-title" className="grid gap-8 bg-selvedge/40 p-6 md:grid-cols-[1fr_1.4fr] md:p-10">
      <div className="flex flex-col gap-3">
        <h2 id="share-title" className="type-h3">Share your photo</h2>
        <p className="text-[0.9375rem] leading-relaxed text-stone">
          Wearing your Rooq saree? Send us a photo and a few words. We review every post before it goes live.
        </p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <GalleryPhotoPicker files={files} onChange={setFiles} error={errors.photo} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="gallery-name" name="name" label="Your name" required maxLength={GALLERY_MAX_NAME} autoComplete="name" error={errors.name} />
          <TextField id="gallery-city" name="city" label="City" maxLength={GALLERY_MAX_CITY} autoComplete="address-level2" />
        </div>
        <div>
          <RatingInput value={rating} onChange={setRating} />
          {errors.rating ? <p role="alert" className="mt-1 text-sm text-dye-deep">{errors.rating}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="gallery-feedback" className="text-sm font-semibold">
            Your feedback <span aria-hidden className="text-red-600">*</span>
          </label>
          <textarea
            id="gallery-feedback"
            name="feedback"
            rows={4}
            maxLength={GALLERY_MAX_FEEDBACK}
            aria-invalid={Boolean(errors.feedback)}
            className="rounded border border-line bg-paper p-3 text-base aria-[invalid=true]:border-dye-deep"
          />
          {errors.feedback ? <p role="alert" className="text-sm text-dye-deep">{errors.feedback}</p> : null}
        </div>
        <TextField id="gallery-phone" name="contactPhone" type="tel" label="Phone" autoComplete="tel" hint="Private. Only our team sees it, in case we need to reach you." />
        {/* Honeypot: real people never see or fill it. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        <div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 size-5 shrink-0 accent-ink" />
            <span>I allow Rooq to show my photo and name on the website.</span>
          </label>
          {errors.consent ? <p role="alert" className="mt-1 text-sm text-dye-deep">{errors.consent}</p> : null}
        </div>
        <button type="submit" disabled={busy} className="type-label inline-flex h-12 items-center justify-center bg-ink px-6 text-chalk hover:bg-ink-soft disabled:opacity-60 sm:self-start">
          {busy ? "Sending…" : "Send my photo"}
        </button>
      </form>
    </section>
  );
}
