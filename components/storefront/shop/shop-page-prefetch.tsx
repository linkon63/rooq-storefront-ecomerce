"use client";

import { useIdlePrefetch } from "@/hooks/use-idle-prefetch";

/** Warms the previous and next listing pages in parallel, so paging is instant. */
export function ShopPagePrefetch({ hrefs }: { hrefs: string[] }) {
  useIdlePrefetch(hrefs);
  return null;
}
