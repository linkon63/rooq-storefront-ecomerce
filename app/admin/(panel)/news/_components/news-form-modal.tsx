"use client";

import { useState, type FormEvent } from "react";
import { AdminIcon } from "../../../_components/admin-shell";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { slugify } from "@/utils/slug";
import { newsFormError, type NewsFormError, type NewsFormState } from "@/utils/mappers/news-form";
import { NewsCoverField } from "./news-cover-field";
import { NewsTextField } from "./news-text-field";

type Props = {
  initial: NewsFormState;
  onClose: () => void;
  /** Resolves to an error message, or null when saved. */
  onSave: (form: NewsFormState) => Promise<string | null>;
};

const FIELD_ERRORS: Record<NewsFormError, string> = {
  title: ERROR_MESSAGES.news.titleRequired,
  slug: ERROR_MESSAGES.news.slugRequired,
  content: ERROR_MESSAGES.news.contentRequired,
};

export function NewsFormModal({ initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<NewsFormState>(initial);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const set = (patch: Partial<NewsFormState>) => setForm((current) => ({ ...current, ...patch }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = newsFormError(form);
    if (missing) {
      setError(FIELD_ERRORS[missing]);
      return;
    }
    setIsSaving(true);
    setError("");
    const failure = await onSave(form);
    setIsSaving(false);
    if (failure) setError(failure);
    else onClose();
  }

  return (
    <div aria-labelledby="news-modal-title" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6" role="dialog">
      <form className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl" onSubmit={submit}>
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900" id="news-modal-title">
              {form.id ? "Edit article" : "Add article"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Journal stories and style notes shown on the storefront.</p>
          </div>
          <button aria-label="Close" className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-slate-300 text-slate-600" disabled={isSaving} onClick={onClose} type="button">
            <AdminIcon className="h-4 w-4" name="x" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          <NewsTextField
            autoFocus
            label="Title"
            onChange={(title) => set({ title, slug: form.id ? form.slug : slugify(title) })}
            required
            value={form.title}
          />
          <NewsTextField label="Slug" onChange={(slug) => set({ slug })} required value={form.slug} />
          <NewsTextField hint="optional" label="Author" onChange={(author) => set({ author })} value={form.author} />
          <NewsTextField hint="short summary" label="Excerpt" onChange={(excerpt) => set({ excerpt })} rows={2} value={form.excerpt} />
          <NewsTextField label="Content" onChange={(content) => set({ content })} required rows={8} value={form.content} />
          <NewsCoverField
            currentUrl={form.removeImage ? null : form.coverImageUrl}
            disabled={isSaving}
            file={form.image}
            onPick={(image) => set({ image, removeImage: false })}
            onRemove={() => set({ image: null, coverImageUrl: null, removeImage: true })}
          />
          <label className="flex cursor-pointer items-center gap-3">
            <input
              checked={form.isPublished}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              onChange={(event) => set({ isPublished: event.target.checked })}
              type="checkbox"
            />
            <span className="text-sm font-semibold text-slate-700">Published (visible on the storefront)</span>
          </label>
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
              {error}
            </p>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button className="h-11 cursor-pointer rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50" disabled={isSaving} onClick={onClose} type="button">
            Cancel
          </button>
          <button className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60" disabled={isSaving} type="submit">
            <AdminIcon className="h-4 w-4" name={form.id ? "check" : "plus"} />
            {isSaving ? "Saving…" : form.id ? "Update article" : "Add article"}
          </button>
        </footer>
      </form>
    </div>
  );
}
