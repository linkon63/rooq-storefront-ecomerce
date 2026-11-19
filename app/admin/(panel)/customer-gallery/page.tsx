"use client";

import { useState } from "react";
import { AdminIcon, PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { useGallery } from "../../_hooks/use-gallery";
import type { AdminGalleryEntry } from "@/types/gallery";
import { GalleryCard } from "./_components/gallery-card";
import { GalleryFilters } from "./_components/gallery-filters";
import { GalleryFormModal } from "./_components/gallery-form-modal";

export default function CustomerGalleryPage() {
  const { items, isLoading, error, status, setStatus, source, setSource, load, changeStatus, create, update, remove } = useGallery();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<AdminGalleryEntry | null>(null);
  const [toDelete, setToDelete] = useState<AdminGalleryEntry | null>(null);
  const [deleteError, setDeleteError] = useState("");

  async function confirmDelete() {
    if (!toDelete) return;
    const failure = await remove(toDelete.id);
    if (failure) setDeleteError(failure);
    else setToDelete(null);
  }

  return (
    <>
      <PageHeader
        title="Customer Gallery"
        description="Approve customer photos and feedback, and add Facebook review screenshots, before they show on the storefront."
        action={
          <div className="flex gap-3">
            <button aria-label="Refresh" className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg border border-slate-300 bg-white" onClick={() => void load()} type="button">
              <AdminIcon className="h-5 w-5" name="refresh" />
            </button>
            <button className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15" onClick={() => setAdding(true)} type="button">
              <AdminIcon className="h-5 w-5" name="plus" />
              Add entry
            </button>
          </div>
        }
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="mb-5">
        <GalleryFilters onSource={setSource} onStatus={setStatus} source={source} status={status} />
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500">Nothing here yet.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((entry) => (
            <GalleryCard
              entry={entry}
              key={entry.id}
              onDelete={(row) => {
                setDeleteError("");
                setToDelete(row);
              }}
              onEdit={setEditing}
              onStatus={(id, next) => void changeStatus(id, next)}
            />
          ))}
        </div>
      )}

      {adding && <GalleryFormModal onClose={() => setAdding(false)} onSave={create} />}
      {editing && <GalleryFormModal entry={editing} key={editing.id} onClose={() => setEditing(null)} onSave={(form) => update(editing.id, form)} />}

      <ConfirmModal
        cancelText="Keep"
        confirmText="Delete entry"
        error={deleteError}
        isDestructive
        isOpen={toDelete !== null}
        message={`Delete ${toDelete?.name}'s entry and its photos? This cannot be undone.`}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete entry"
      />
    </>
  );
}
