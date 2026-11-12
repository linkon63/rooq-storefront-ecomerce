"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateSettings } from "@/lib/admin-api/platform";
import type { AppSettings } from "@/types/admin/settings";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { EMPTY_GENERAL_FORM, toGeneralForm, toGeneralPayload, type GeneralForm } from "@/utils/settings/general-form";
import { useSettingsLoading } from "../../../../_hooks/use-settings";
import { useBrandImages } from "./use-brand-images";

export type SetGeneralField = <K extends keyof GeneralForm>(key: K, value: GeneralForm[K]) => void;

/** Form state, brand images and save for Settings → General. */
export function useGeneralSettings() {
  const { loading, error, loadSettings } = useSettingsLoading();
  const [saved, setSaved] = useState<AppSettings | null>(null);
  const [form, setForm] = useState<GeneralForm>(EMPTY_GENERAL_FORM);
  const [saving, setSaving] = useState(false);
  const images = useBrandImages();

  const load = useCallback(async () => {
    const data = await loadSettings();
    if (!data) return;
    setSaved(data);
    setForm(toGeneralForm(data));
  }, [loadSettings]);

  useEffect(() => {
    load();
  }, [load]);

  const setField: SetGeneralField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function save() {
    if (!form.shopName.trim()) {
      toast.error(ERROR_MESSAGES.ui.requiredFields);
      return;
    }
    setSaving(true);
    try {
      let mediaFields: Awaited<ReturnType<typeof images.commit>>;
      try {
        mediaFields = await images.commit();
      } catch (uploadError) {
        toast.error(uploadError instanceof Error && uploadError.message ? uploadError.message : ERROR_MESSAGES.settings.imageUploadFailed);
        return;
      }
      const next = await updateSettings({ ...toGeneralPayload(form), ...mediaFields });
      images.reset();
      setSaved(next);
      setForm(toGeneralForm(next));
      toast.success(SUCCESS_MESSAGES.common.saved);
    } catch (saveError) {
      toast.error(saveError instanceof Error && saveError.message ? saveError.message : ERROR_MESSAGES.settings.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  return { loading, error, saving, saved, form, setField, images, save };
}
