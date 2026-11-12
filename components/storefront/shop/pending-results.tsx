"use client";

import type { ReactNode } from "react";
import { useShopNavigation } from "./shop-navigation";

/** Dims the server-rendered grid while a filter change is in flight. */
export function PendingResults({ children }: { children: ReactNode }) {
  const { meta } = useShopNavigation();
  return (
    <div aria-busy={meta.isPending} className={`transition-opacity duration-200 ${meta.isPending ? "opacity-50" : "opacity-100"}`}>
      {children}
    </div>
  );
}
