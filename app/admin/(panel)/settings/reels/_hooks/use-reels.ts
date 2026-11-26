"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { reelsApi } from "@/lib/admin-api/reels";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { AdminReel } from "@/types/admin/reel";
import { errorText } from "@/utils/api-error";

const messages = ERROR_MESSAGES.reel;

/** Reels for the admin page; every change is saved at once and toasted. */
export function useReels() {
  const [reels, setReels] = useState<AdminReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    reelsApi
      .list()
      .then(setReels)
      .catch((err: unknown) => toast.error(errorText(err, messages.loadFailed)))
      .finally(() => setLoading(false));
  }, []);

  async function run<T>(task: () => Promise<T>, fallback: string, success: string): Promise<T | null> {
    setBusy(true);
    try {
      const result = await task();
      toast.success(success);
      return result;
    } catch (err) {
      toast.error(errorText(err, fallback));
      return null;
    } finally {
      setBusy(false);
    }
  }

  /** True when the video was saved, so the form can clear itself. */
  const upload = async (video: File, productId: string) => {
    const added = await run(() => reelsApi.upload(video, productId), messages.saveFailed, SUCCESS_MESSAGES.reel.added);
    if (added) setReels((current) => [...current, added]);
    return added !== null;
  };

  const update = async (id: string, patch: { productId?: string; isActive?: boolean }) => {
    const saved = await run(() => reelsApi.update(id, patch), messages.saveFailed, SUCCESS_MESSAGES.reel.saved);
    if (saved) setReels((current) => current.map((reel) => (reel.id === id ? saved : reel)));
  };

  const remove = async (id: string) => {
    if ((await run(() => reelsApi.remove(id), messages.deleteFailed, SUCCESS_MESSAGES.reel.deleted)) !== null) {
      setReels((current) => current.filter((reel) => reel.id !== id));
    }
  };

  /** Moves a reel one place up (-1) or down (+1) and saves the new order. */
  const move = async (index: number, step: -1 | 1) => {
    const target = index + step;
    if (target < 0 || target >= reels.length) return;
    const next = [...reels];
    [next[index], next[target]] = [next[target], next[index]];
    const saved = await run(() => reelsApi.reorder(next.map((reel) => reel.id)), messages.saveFailed, SUCCESS_MESSAGES.reel.reordered);
    if (saved) setReels(saved);
  };

  return { reels, loading, busy, upload, update, remove, move };
}
