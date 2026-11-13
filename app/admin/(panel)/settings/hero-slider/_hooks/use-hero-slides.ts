"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { heroApi } from "@/lib/admin-api/hero-slides";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { AdminHeroSlide, HeroMode } from "@/types/admin/hero";
import { errorText } from "@/utils/api-error";

const messages = ERROR_MESSAGES.heroSlide;

/** Hero slides + mode for the admin page; every change is saved at once and toasted. */
export function useHeroSlides() {
  const [slides, setSlides] = useState<AdminHeroSlide[]>([]);
  const [mode, setModeState] = useState<HeroMode>("SLIDER");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, current] = await Promise.all([heroApi.list(), heroApi.getMode()]);
      setSlides(list);
      setModeState(current.mode);
    } catch (err) {
      toast.error(errorText(err, messages.loadFailed));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  const setMode = async (next: HeroMode) => {
    if ((await run(() => heroApi.setMode(next), messages.modeFailed, SUCCESS_MESSAGES.heroSlide.modeSaved)) !== null) setModeState(next);
  };

  const upload = async (files: File[], productId: string | null) => {
    const added = await run(() => heroApi.upload(files, productId), messages.saveFailed, SUCCESS_MESSAGES.heroSlide.added(files.length));
    if (added) setSlides((current) => [...current, ...added]);
  };

  const update = async (id: string, patch: { productId?: string | null; isActive?: boolean }) => {
    const saved = await run(() => heroApi.update(id, patch), messages.saveFailed, SUCCESS_MESSAGES.heroSlide.saved);
    if (saved) setSlides((current) => current.map((slide) => (slide.id === id ? saved : slide)));
  };

  const remove = async (id: string) => {
    if ((await run(() => heroApi.remove(id), messages.deleteFailed, SUCCESS_MESSAGES.heroSlide.deleted)) !== null) {
      setSlides((current) => current.filter((slide) => slide.id !== id));
    }
  };

  /** Moves a slide one place up (-1) or down (+1) and saves the new order. */
  const move = async (index: number, step: -1 | 1) => {
    const target = index + step;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    const saved = await run(() => heroApi.reorder(next.map((slide) => slide.id)), messages.saveFailed, SUCCESS_MESSAGES.heroSlide.reordered);
    if (saved) setSlides(saved);
  };

  return { slides, mode, loading, busy, setMode, upload, update, remove, move };
}
