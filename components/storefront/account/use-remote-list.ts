"use client";

import { useCallback, useEffect, useState } from "react";
import { errorText } from "@/utils/api-error";

/** Load a list once (and on `reload()`), with loading and error state for the panel. */
export function useRemoteList<T>(load: () => Promise<T[]>, failure: string) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setItems(await load());
    } catch (caught) {
      setError(errorText(caught, failure));
      setItems((current) => current ?? []);
    }
  }, [failure, load]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, error, reload, setItems };
}
