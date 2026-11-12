"use client";

import { useRef } from "react";
import { AdminIcon } from "../../../../_components/admin-shell";
import { ImageSizeHint } from "../../../../_components/admin-ui";
import { pickImages } from "@/lib/admin-image-upload";
import type { HeroBannerSlot } from "@/lib/constants/hero-banners";
import type { ProductDiscount } from "@/types/product-discount";
import type { HeroBannerSlotState } from "@/utils/mappers/hero-banner";
import { FieldLabel, StatusToggle } from "../../_components/settings-ui";
import { HeroLayoutDiagram } from "./hero-layout-diagram";

type Props = {
  info: HeroBannerSlot;
  slot: HeroBannerSlotState;
  discounts: ProductDiscount[];
  onPatch: (patch: Partial<HeroBannerSlotState>) => void;
  onRemove: () => void;
};

export function BannerSlotCard({ info, slot, discounts, onPatch, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayUrl = slot.preview ?? slot.imageUrl;
  const openPicker = () => inputRef.current?.click();

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 p-5">
      <div className="mb-4 flex items-start gap-3">
        <HeroLayoutDiagram active={info.key} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{info.label}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{info.placement}</p>
        </div>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">Recommended size {info.size} px</p>
        <div className="flex shrink-0 items-center gap-2">
          <StatusToggle active={slot.active} onChange={(active) => onPatch({ active })} />
          <span className="text-xs font-medium text-slate-500">{slot.active ? "Visible" : "Hidden"}</span>
        </div>
      </div>
      <input
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const [file] = pickImages(e.target) ?? [];
          if (file) onPatch({ file, preview: URL.createObjectURL(file) });
        }}
        ref={inputRef}
        type="file"
      />
      {displayUrl ? (
        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={info.label} className="h-40 w-full object-cover" src={displayUrl} />
          <button aria-label={`Remove ${info.label.toLowerCase()}`} className="absolute right-2 top-2 grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600" onClick={onRemove} type="button">
            <AdminIcon className="h-3.5 w-3.5" name="x" />
          </button>
          <button className="absolute bottom-2 right-2 cursor-pointer rounded-md bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow transition hover:bg-white" onClick={openPicker} type="button">
            Replace
          </button>
        </div>
      ) : (
        <button className="grid h-40 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-slate-400 hover:bg-slate-100" onClick={openPicker} type="button">
          <span className="flex flex-col items-center gap-1.5">
            <AdminIcon className="h-7 w-7 text-slate-300" name="plus" />
            <span className="text-xs font-semibold text-slate-500">Upload banner image</span>
            <ImageSizeHint className="mt-1" />
          </span>
        </button>
      )}
      <div className="mt-auto pt-4">
        <FieldLabel>Links to offer or discount</FieldLabel>
        <select
          className="h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          onChange={(e) => onPatch({ discountId: e.target.value })}
          value={slot.discountId}
        >
          <option value="">No offer — open the full shop</option>
          {discounts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs font-medium text-slate-400">Clicking this banner opens the shop showing only this offer&apos;s products.</p>
      </div>
    </div>
  );
}
