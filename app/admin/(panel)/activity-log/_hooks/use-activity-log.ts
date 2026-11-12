"use client";

import { useCallback, useEffect, useState } from "react";
import { listActivityLogs } from "@/lib/admin-api/platform";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { ActivityLogEntry } from "@/types/admin/staff";
import { errorText } from "@/utils/api-error";

export function useActivityLog() {
  const [rows, setRows] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setRows(await listActivityLogs());
    } catch (err) {
      setError(errorText(err, ERROR_MESSAGES.activityLog.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, isLoading, error, reload: load };
}
