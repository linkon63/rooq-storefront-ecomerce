"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, jsonInit } from "@/lib/admin/http";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { errorText } from "@/utils/api-error";

type WithId = { id: string };

/**
 * List + create/update/delete over a JSON admin resource (`GET path`,
 * `POST path`, `PATCH path/:id`, `DELETE path/:id`). Errors land in `error`
 * with messages from ERROR_MESSAGES; writes reload the list.
 */
export function useCrudResource<T extends WithId>(path: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      const res = await apiRequest<T[] | { data: T[] }>(path);
      setRows(Array.isArray(res) ? res : res.data);
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  /** POST (no id) or PATCH (with id); resolves true on success. */
  async function save(id: string | undefined, body: unknown): Promise<boolean> {
    setError("");
    setIsSaving(true);
    try {
      await apiRequest<T>(id ? `${path}/${id}` : path, jsonInit(id ? "PATCH" : "POST", body));
      await load();
      return true;
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  /** PATCH one row in place without reloading (toggles). */
  async function patch(id: string, body: Partial<T>): Promise<void> {
    try {
      const updated = await apiRequest<T>(`${path}/${id}`, jsonInit("PATCH", body));
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...body, ...(updated ?? {}) } : row)));
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.saveFailed));
    }
  }

  async function remove(id: string): Promise<boolean> {
    setError("");
    try {
      await apiRequest(`${path}/${id}`, { method: "DELETE" });
      await load();
      return true;
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
      return false;
    }
  }

  return { rows, isLoading, isSaving, error, setError, load, save, patch, remove };
}
