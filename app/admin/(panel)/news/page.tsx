"use client";

import { useMemo, useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { useNews } from "../../_hooks/use-news";
import type { News } from "@/types/admin/content";
import { EMPTY_NEWS_FORM, newsToForm, type NewsFormState } from "@/utils/mappers/news-form";
import { NewsFormModal } from "./_components/news-form-modal";
import { NewsTable } from "./_components/news-table";

export default function NewsAdminPage() {
  const { items, isLoading, error, load, save, remove } = useNews();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<NewsFormState | null>(null);
  const [toDelete, setToDelete] = useState<News | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((n) => `${n.title} ${n.slug} ${n.author ?? ""}`.toLowerCase().includes(query));
  }, [items, search]);

  async function confirmDelete() {
    if (!toDelete) return;
    const failure = await remove(toDelete);
    if (failure) setDeleteError(failure);
    else setToDelete(null);
  }

  return (
    <>
      <PageHeader
        title="News & Journal"
        description="Write the stories, drop announcements and style notes that appear on the storefront."
        action={
          <div className="flex gap-3">
            <button aria-label="Refresh" className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg border border-slate-300 bg-white" onClick={() => void load()} type="button">
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15" onClick={() => setEditing(EMPTY_NEWS_FORM)} type="button">
              <AdminIcon className="h-5 w-5" name="plus" />
              Add article
            </button>
          </div>
        }
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className="text-sm font-medium text-slate-500">
            {filtered.length} {filtered.length === 1 ? "article" : "articles"}
          </p>
          <label className="flex h-10 w-full max-w-md items-center gap-3 rounded-lg border border-slate-300 px-4">
            <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
            <span className="sr-only">Search articles</span>
            <input className="w-full bg-transparent text-sm font-medium outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Search articles" type="search" value={search} />
          </label>
        </div>
        <NewsTable
          hasQuery={search.trim() !== ""}
          isLoading={isLoading}
          items={filtered}
          onDelete={(news) => {
            setDeleteError("");
            setToDelete(news);
          }}
          onEdit={(news) => setEditing(newsToForm(news))}
        />
      </section>

      {editing && <NewsFormModal initial={editing} key={editing.id ?? "new"} onClose={() => setEditing(null)} onSave={save} />}

      <ConfirmModal
        cancelText="Keep"
        confirmText="Delete article"
        error={deleteError}
        isDestructive
        isOpen={toDelete !== null}
        message={`Delete "${toDelete?.title}"? This cannot be undone.`}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete article"
      />
    </>
  );
}
