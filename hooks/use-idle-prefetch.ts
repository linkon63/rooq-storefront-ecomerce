"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

/** Data saver or 2G: leave the bandwidth to what the shopper is looking at. */
function constrainedNetwork(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  return Boolean(connection?.saveData) || /(^|-)2g$/.test(connection?.effectiveType ?? "");
}

/**
 * Prefetches every href (full route + data, all at once) once the browser is
 * idle, so the next tap renders from the client cache. Skipped on constrained
 * networks. `hrefs` is compared by value.
 */
export function useIdlePrefetch(hrefs: readonly string[]) {
  const router = useRouter();
  const key = hrefs.join("\n");

  useEffect(() => {
    if (!key || constrainedNetwork()) return;
    const run = () => key.split("\n").forEach((href) => router.prefetch(href));
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 300);
    return () => window.clearTimeout(id);
  }, [key, router]);
}
