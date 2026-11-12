"use client";

import { useState } from "react";
import type { AppSettings } from "@/types/admin/settings";
import { ImageSizeHint } from "../../../../_components/admin-ui";
import type { BrandImageKey } from "../_hooks/use-brand-images";
import { LogoSlot } from "./logo-slot";
import { SettingsRow } from "./settings-row";

const TABS: readonly { key: BrandImageKey; label: string; hint: string }[] = [
  { key: "icon", label: "Icon", hint: "Square mark used in the admin and app icons." },
  { key: "logo", label: "Icon + text", hint: "Full wordmark shown in the storefront header." },
  { key: "favicon", label: "Favicon", hint: "Small icon in the browser tab." },
];

type Images = {
  pick: (key: BrandImageKey, file: File) => void;
  clear: (key: BrandImageKey) => void;
  displayUrl: (key: BrandImageKey, savedUrl: string | null | undefined) => string | null;
};

export function BrandImagesSection({ saved, images }: { saved: AppSettings | null; images: Images }) {
  const [tab, setTab] = useState<BrandImageKey>("icon");
  const active = TABS.find((item) => item.key === tab) ?? TABS[0];

  return (
    <SettingsRow hint="Images are stored with the shop and served optimised. They are uploaded when you save." label="Logo">
      <ImageSizeHint className="mb-4" />
      <div className="mb-5 flex border-b border-slate-200" role="tablist">
        {TABS.map((item) => (
          <button
            aria-selected={tab === item.key}
            className={`border-b-2 px-4 pb-3 pt-1 text-sm font-black transition ${
              tab === item.key ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
            key={item.key}
            onClick={() => setTab(item.key)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      <LogoSlot
        hint={active.hint}
        key={active.key}
        label={active.label}
        onPick={(file) => images.pick(active.key, file)}
        onRemove={() => images.clear(active.key)}
        url={images.displayUrl(active.key, saved?.[active.key])}
      />
    </SettingsRow>
  );
}
