"use client";

import { useSyncExternalStore } from "react";
import { Toaster } from "sonner";

/** Tailwind's `md` breakpoint — below it the storefront is in its phone layout. */
const PHONE_QUERY = "(max-width: 767px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Phones get toasts at the top, where the thumb-zone contact button and the
 * sticky product/checkout bars cannot cover them; larger screens keep them
 * bottom-right.
 */
export default function StoreToaster() {
  const isPhone = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );

  return (
    <Toaster position={isPhone ? "top-center" : "bottom-right"} richColors closeButton />
  );
}
