"use client";

import { useEffect, useState } from "react";
import { uploadAdminImage } from "@/lib/admin-api/platform";

export type BrandImageKey = "icon" | "logo" | "favicon";

type Slot = { file: File | null; preview: string | null; cleared: boolean };
const EMPTY: Slot = { file: null, preview: null, cleared: false };
const KEYS: readonly BrandImageKey[] = ["icon", "logo", "favicon"];

/** The `…MediaId` fields PATCH /settings understands. */
const MEDIA_FIELD: Record<BrandImageKey, "iconMediaId" | "logoMediaId" | "faviconMediaId"> = {
  icon: "iconMediaId",
  logo: "logoMediaId",
  favicon: "faviconMediaId",
};

/**
 * Pending logo / icon / favicon changes. Nothing is uploaded until save:
 * `commit()` uploads picked files (stored as WebP in the database) and
 * returns the media-id fields to PATCH.
 */
export function useBrandImages() {
  const [slots, setSlots] = useState<Record<BrandImageKey, Slot>>({ icon: EMPTY, logo: EMPTY, favicon: EMPTY });

  useEffect(
    () => () => {
      for (const key of KEYS) if (slots[key].preview) URL.revokeObjectURL(slots[key].preview);
    },
    [slots],
  );

  function pick(key: BrandImageKey, file: File) {
    setSlots((prev) => ({ ...prev, [key]: { file, preview: URL.createObjectURL(file), cleared: false } }));
  }

  function clear(key: BrandImageKey) {
    setSlots((prev) => ({ ...prev, [key]: { file: null, preview: null, cleared: true } }));
  }

  function reset() {
    setSlots({ icon: EMPTY, logo: EMPTY, favicon: EMPTY });
  }

  async function commit(): Promise<Partial<Record<(typeof MEDIA_FIELD)[BrandImageKey], string | null>>> {
    const fields: Partial<Record<(typeof MEDIA_FIELD)[BrandImageKey], string | null>> = {};
    for (const key of KEYS) {
      const slot = slots[key];
      if (slot.file) fields[MEDIA_FIELD[key]] = (await uploadAdminImage(slot.file, key)).id;
      else if (slot.cleared) fields[MEDIA_FIELD[key]] = null;
    }
    return fields;
  }

  /** What to show: the pending preview, nothing if cleared, else the saved URL. */
  function displayUrl(key: BrandImageKey, savedUrl: string | null | undefined): string | null {
    const slot = slots[key];
    if (slot.preview) return slot.preview;
    if (slot.cleared) return null;
    return savedUrl ?? null;
  }

  return { pick, clear, reset, commit, displayUrl };
}
