"use client";

import { useSyncExternalStore } from "react";
import { Toaster } from "sonner";

import { PHONE_QUERY } from "@/lib/viewport";

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
    <Toaster
      position={isPhone ? "top-center" : "bottom-right"}
      // On larger screens the floating contact / back-to-top buttons own the
      // bottom-right corner, so toasts stack just above them.
      offset={isPhone ? undefined : { bottom: 150, right: 24 }}
      richColors
      closeButton
    />
  );
}
