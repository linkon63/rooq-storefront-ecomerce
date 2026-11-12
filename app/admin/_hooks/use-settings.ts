"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getSettings } from "@/lib/admin-api/platform";
import { apiRequest } from "@/lib/admin/http";
import type { AppSettings } from "@/types/admin/settings";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** PATCH a settings-like endpoint (/settings, /policies) with toasts. */
export function useSettingsSaving() {
  const [saving, setSaving] = useState(false);

  const saveSettings = useCallback(
    async (
      endpoint: "/settings" | "/policies",
      body: Record<string, unknown>,
      options?: { successMessage?: string; errorMessage?: string; onSuccess?: () => Promise<void> },
    ) => {
      setSaving(true);
      try {
        await apiRequest(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success(options?.successMessage ?? SUCCESS_MESSAGES.common.saved);
        await options?.onSuccess?.();
        return true;
      } catch (error) {
        toast.error(errorText(error, options?.errorMessage ?? ERROR_MESSAGES.settings.saveFailed));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { saving, saveSettings };
}

/** GET /settings. Resolves null on failure and exposes the error for the page. */
export function useSettingsLoading() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSettings = useCallback(async (): Promise<AppSettings | null> => {
    setLoading(true);
    setError("");
    try {
      return await getSettings();
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.settings.loadFailed));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, loadSettings };
}
