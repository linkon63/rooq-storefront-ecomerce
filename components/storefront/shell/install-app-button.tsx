"use client";

import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import type { Messages } from "@/lib/i18n/messages";

const isIos = () => typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

/** Footer "Install the app": the browser prompt when available, otherwise a short how-to. */
export function InstallAppButton({ t }: { t: Messages["footer"] }) {
  const { canPrompt, isInstalled, install } = usePwaInstall();
  const [hint, setHint] = useState(false);
  if (isInstalled) return null;

  async function onClick() {
    if (canPrompt) await install();
    else setHint((open) => !open);
  }

  return (
    <div className="flex flex-col items-center gap-2 lg:items-start">
      <button
        type="button"
        onClick={() => void onClick()}
        aria-expanded={canPrompt ? undefined : hint}
        className="inline-flex h-11 items-center gap-2 rounded border border-chalk/40 px-4 text-sm font-semibold hover:bg-chalk/10"
      >
        <FiDownload aria-hidden className="size-4" /> {t.installApp}
      </button>
      {hint ? (
        <p role="status" className="max-w-[34ch] text-xs text-chalk/75">
          {isIos() ? t.installHintIos : t.installHintOther}
        </p>
      ) : null}
    </div>
  );
}
