"use client";

import { useCallback, useEffect, useState } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { errorText } from "@/utils/error-text";

export type AsyncData<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => Promise<void>;
  setData: (update: T | ((current: T | null) => T | null)) => void;
};

/** Loads `loader()` on mount and whenever `key` changes; errors become ERROR_MESSAGES text. */
export function useAsyncData<T>(loader: () => Promise<T>, key: string): AsyncData<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDataState(await loader());
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.ui.loadFailed));
    } finally {
      setLoading(false);
    }
    // `key` stands in for the loader's inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setData = useCallback((update: T | ((current: T | null) => T | null)) => {
    setDataState((current) => (typeof update === "function" ? (update as (c: T | null) => T | null)(current) : update));
  }, []);

  return { data, error, loading, reload, setData };
}
