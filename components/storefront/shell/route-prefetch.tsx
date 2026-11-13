"use client";

import { usePathname } from "next/navigation";
import { useIdlePrefetch } from "@/hooks/use-idle-prefetch";

/** Main storefront routes, warmed in parallel from every page (the logo, Shop, New, Sale). */
const MAIN_ROUTES = ["/", "/shop", "/new", "/sale"] as const;

export function RoutePrefetch() {
  const pathname = usePathname();
  useIdlePrefetch(MAIN_ROUTES.filter((href) => href !== pathname));
  return null;
}
