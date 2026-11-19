"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { galleryApi } from "@/lib/admin-api/gallery";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { AdminGalleryEntry, GallerySource, GalleryStatus } from "@/types/gallery";

export type GalleryStatusFilter = GalleryStatus | "ALL";
export type GallerySourceFilter = GallerySource | "ALL";

const messageOf = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

const STATUS_TOASTS: Record<GalleryStatus, string> = {
  APPROVED: SUCCESS_MESSAGES.gallery.approved,
  REJECTED: SUCCESS_MESSAGES.gallery.rejected,
  PENDING: SUCCESS_MESSAGES.gallery.pending,
};

/** Customer gallery list with status/source filters and the staff actions. */
export function useGallery() {
  const [status, setStatus] = useState<GalleryStatusFilter>("PENDING");
  const [source, setSource] = useState<GallerySourceFilter>("ALL");
  const [items, setItems] = useState<AdminGalleryEntry[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await galleryApi.list({ status: status === "ALL" ? undefined : status, source: source === "ALL" ? undefined : source }));
    } catch (err) {
      setError(messageOf(err, ERROR_MESSAGES.gallery.loadFailed));
    } finally {
      setLoading(false);
    }
  }, [status, source]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeStatus(id: string, next: GalleryStatus): Promise<void> {
    try {
      await galleryApi.setStatus(id, next);
      toast.success(STATUS_TOASTS[next]);
      await load();
    } catch (err) {
      toast.error(messageOf(err, ERROR_MESSAGES.gallery.statusFailed));
    }
  }

  async function create(form: FormData): Promise<string | null> {
    try {
      await galleryApi.create(form);
      toast.success(SUCCESS_MESSAGES.gallery.added);
      await load();
      return null;
    } catch (err) {
      return messageOf(err, ERROR_MESSAGES.gallery.saveFailed);
    }
  }

  /** Returns an error message, or null on success. */
  async function update(id: string, form: FormData): Promise<string | null> {
    try {
      await galleryApi.update(id, form);
      toast.success(SUCCESS_MESSAGES.gallery.updated);
      await load();
      return null;
    } catch (err) {
      return messageOf(err, ERROR_MESSAGES.gallery.saveFailed);
    }
  }

  /** Returns an error message, or null on success. */
  async function remove(id: string): Promise<string | null> {
    try {
      await galleryApi.remove(id);
      toast.success(SUCCESS_MESSAGES.gallery.deleted);
      await load();
      return null;
    } catch (err) {
      return messageOf(err, ERROR_MESSAGES.gallery.deleteFailed);
    }
  }

  return { items, isLoading, error, status, setStatus, source, setSource, load, changeStatus, create, update, remove };
}
