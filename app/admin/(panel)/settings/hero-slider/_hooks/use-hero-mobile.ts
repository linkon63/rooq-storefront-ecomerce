"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { heroApi } from "@/lib/admin-api/hero-slides";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { AdminHeroMobileProduct, HeroMobileItemInput } from "@/types/admin/hero";
import { errorText } from "@/utils/api-error";

const messages = ERROR_MESSAGES.heroSlide;

const toInput = (item: AdminHeroMobileProduct): HeroMobileItemInput => ({ productId: item.product.id, mediaId: item.photo?.id ?? null });

/** The phone hero's product picks; every change saves the whole list at once and is toasted. */
export function useHeroMobile() {
  const [items, setItems] = useState<AdminHeroMobileProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    heroApi
      .listMobile()
      .then((list) => live && setItems(list))
      .catch((err: unknown) => toast.error(errorText(err, messages.mobileLoadFailed)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  const save = async (next: HeroMobileItemInput[]) => {
    setBusy(true);
    try {
      setItems(await heroApi.setMobile(next));
      toast.success(SUCCESS_MESSAGES.heroSlide.mobileSaved);
    } catch (err) {
      toast.error(errorText(err, messages.mobileSaveFailed));
    } finally {
      setBusy(false);
    }
  };

  const current = () => items.map(toInput);

  const add = (productId: string) => void save([...current(), { productId, mediaId: null }]);

  const setPhoto = (index: number, mediaId: string | null) =>
    void save(current().map((item, at) => (at === index ? { ...item, mediaId } : item)));

  const remove = (index: number) => void save(current().filter((_, at) => at !== index));

  /** Moves a pick one place up (-1) or down (+1). */
  const move = (index: number, step: -1 | 1) => {
    const target = index + step;
    if (target < 0 || target >= items.length) return;
    const next = current();
    [next[index], next[target]] = [next[target], next[index]];
    void save(next);
  };

  return { items, loading, busy, add, setPhoto, remove, move };
}
