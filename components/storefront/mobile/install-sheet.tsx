"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import type { Messages } from "@/lib/constants/storefront-copy";
import { shouldOfferInstall } from "@/lib/storefront/install-visits";
import { isTabBarHidden } from "@/utils/storefront/mobile-nav";

/* The dialog code loads only when the offer is actually shown. */
const Modal = dynamic(() => import("../shared/modal").then((m) => m.Modal), { ssr: false });

/** From the second visit, phones are offered "Install Rooq" once. */
export function InstallSheet({ t }: { t: Pick<Messages["footer"], "installApp" | "installHintIos"> }) {
  const pathname = usePathname();
  const isPhone = useMediaQuery("(width < 48rem)");
  const { canPrompt, isInstalled, install } = usePwaInstall();
  const [due, setDue] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.matchMedia("(display-mode: standalone)").matches);
      setDue(shouldOfferInstall());
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const open = due && isPhone && !isInstalled && (canPrompt || isIos) && !isTabBarHidden(pathname);
  if (!open) return null;

  return (
    <Modal open onOpenChange={(next) => setDue(next)} title={t.installApp} placement="bottom">
      <div className="flex flex-col gap-4 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <p className="text-sm text-stone">{canPrompt ? "Open Rooq from your home screen, full screen." : t.installHintIos}</p>
        {canPrompt ? (
          <button type="button" onClick={() => void install().finally(() => setDue(false))} className="press h-12 rounded bg-ink text-sm font-semibold text-chalk">
            {t.installApp}
          </button>
        ) : null}
        <button type="button" onClick={() => setDue(false)} className="h-11 text-sm font-semibold underline underline-offset-4">
          Not now
        </button>
      </div>
    </Modal>
  );
}
