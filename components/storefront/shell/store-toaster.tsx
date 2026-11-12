"use client";

import { Toaster } from "sonner";

/** Toasts sit bottom-centre on phones (thumb reach) and top-right on desktop. */
export function StoreToaster() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "!rounded !border-0 !bg-ink !text-chalk !font-[family-name:var(--font-archivo)]",
          description: "!text-chalk/80",
        },
      }}
    />
  );
}
