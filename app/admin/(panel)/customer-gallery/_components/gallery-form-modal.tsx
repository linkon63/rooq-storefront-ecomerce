"use client";

import { useState } from "react";
import { FormModal } from "../../../_components/form-modal";
import { FormField, INPUT_CLASS, TEXTAREA_CLASS } from "../../../_components/form-field";
import { CheckboxField } from "../../../_components/checkbox-field";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { GALLERY_MAX_CITY, GALLERY_MAX_FEEDBACK, GALLERY_MAX_NAME, GALLERY_MAX_PHOTOS } from "@/lib/constants/gallery";
import type { AdminGalleryEntry, GalleryImage, GallerySource } from "@/types/gallery";
import { GalleryPhotoField } from "./gallery-photo-field";

type Props = { entry?: AdminGalleryEntry; onClose: () => void; onSave: (form: FormData) => Promise<string | null> };

/** Staff add a customer photo or Facebook screenshot (goes live right away), or fix an existing entry. */
export function GalleryFormModal({ entry, onClose, onSave }: Props) {
  const editing = Boolean(entry);
  const [source, setSource] = useState<GallerySource>(entry?.source ?? "FACEBOOK");
  const [existing, setExisting] = useState<GalleryImage[]>(entry?.images ?? []);
  const [files, setFiles] = useState<File[]>([]);
  const [consent, setConsent] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(form: HTMLFormElement) {
    if (existing.length + files.length === 0) return setError(ERROR_MESSAGES.gallery.photoRequired);
    if (!consent) return setError(ERROR_MESSAGES.gallery.consentRequired);
    const data = new FormData(form);
    data.set("source", source);
    if (editing) data.set("keep", JSON.stringify(existing.map((image) => image.id)));
    else data.set("consent", "true");
    data.delete("photo");
    files.forEach((file) => data.append("photo", file));
    setBusy(true);
    const failure = await onSave(data);
    setBusy(false);
    if (failure) setError(failure);
    else onClose();
  }

  return (
    <FormModal
      busy={busy}
      description={editing ? "Fix anything the customer got wrong. The approval status stays as it is." : "Added entries go live immediately."}
      error={error}
      onClose={onClose}
      onSubmit={(event) => void submit(event.currentTarget)}
      submitLabel={editing ? "Save changes" : "Add entry"}
      title={editing ? "Edit gallery entry" : "Add gallery entry"}
    >
      <FormField label="Type">
        <select className={INPUT_CLASS} onChange={(event) => setSource(event.target.value as GallerySource)} value={source}>
          <option value="FACEBOOK">Facebook screenshot</option>
          <option value="WEBSITE">Website photo</option>
        </select>
      </FormField>
      <FormField
        hint={source === "FACEBOOK" ? "Blur other people's names and profile photos in the screenshot before uploading." : undefined}
        label={`Photos (1–${GALLERY_MAX_PHOTOS})`}
      >
        <GalleryPhotoField existing={existing} files={files} onExistingChange={setExisting} onFilesChange={setFiles} />
      </FormField>
      <FormField label="Customer name">
        <input className={INPUT_CLASS} maxLength={GALLERY_MAX_NAME} defaultValue={entry?.name} name="name" required />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="City (optional)">
          <input className={INPUT_CLASS} maxLength={GALLERY_MAX_CITY} defaultValue={entry?.city ?? ""} name="city" />
        </FormField>
        <FormField label="Rating">
          <select className={INPUT_CLASS} defaultValue={entry?.rating ?? 5} name="rating">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{`${n} star${n > 1 ? "s" : ""}`}</option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Feedback">
        <textarea className={TEXTAREA_CLASS} maxLength={GALLERY_MAX_FEEDBACK} defaultValue={entry?.feedback} name="feedback" required rows={4} />
      </FormField>
      <FormField hint="Private, for follow-up only." label="Phone (optional)">
        <input className={INPUT_CLASS} defaultValue={entry?.contactPhone ?? ""} name="contactPhone" type="tel" />
      </FormField>
      {!editing && <CheckboxField checked={consent} label="I have the customer's permission to show this" onChange={setConsent} />}
    </FormModal>
  );
}
