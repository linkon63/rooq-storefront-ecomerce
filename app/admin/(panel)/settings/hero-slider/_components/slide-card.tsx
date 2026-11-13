"use client";

/* eslint-disable @next/next/no-img-element -- admin preview of an already-processed media URL */
import type { AdminHeroSlide } from "@/types/admin/hero";
import { AdminIcon } from "../../../../_components/admin-icons";
import { StatusToggle } from "../../_components/settings-ui";
import { ProductLinkField } from "./product-link-field";

type Props = {
  slide: AdminHeroSlide;
  index: number;
  count: number;
  busy: boolean;
  onUpdate: (patch: { productId?: string | null; isActive?: boolean }) => void;
  onMove: (step: -1 | 1) => void;
  onRemove: () => void;
};

const iconButton = "grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30";

/** One slide: preview, its position, show/hide, the linked product, delete. */
export function SlideCard({ slide, index, count, busy, onUpdate, onMove, onRemove }: Props) {
  return (
    <li className={`flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 ${slide.isActive ? "" : "opacity-60"}`}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-slate-50">
        <img alt={slide.image.alt ?? ""} className="h-full w-full object-contain" src={slide.image.url} />
        <span className="absolute left-2 top-2 rounded bg-slate-900/80 px-2 py-0.5 text-xs font-bold text-white">{index + 1}</span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Move earlier" className={iconButton} disabled={busy || index === 0} onClick={() => onMove(-1)}>
          <AdminIcon className="h-4 w-4" name="arrow-left" />
        </button>
        <button type="button" aria-label="Move later" className={iconButton} disabled={busy || index === count - 1} onClick={() => onMove(1)}>
          <AdminIcon className="h-4 w-4" name="arrow-right" />
        </button>
        <span className="ml-auto flex items-center gap-2 text-xs font-bold text-slate-500">
          {slide.isActive ? "Shown" : "Hidden"}
          <StatusToggle active={slide.isActive} onChange={(isActive) => onUpdate({ isActive })} />
        </span>
        <button type="button" aria-label="Delete slide" className={`${iconButton} text-red-600`} disabled={busy} onClick={onRemove}>
          <AdminIcon className="h-4 w-4" name="trash" />
        </button>
      </div>
      <ProductLinkField
        disabled={busy}
        value={slide.product ? { id: slide.product.id, name: slide.product.name } : null}
        onChange={(product) => onUpdate({ productId: product?.id ?? null })}
      />
      {slide.product && slide.product.status !== "active" ? (
        <p className="text-xs font-semibold text-amber-700">This product is not active, so its card is hidden.</p>
      ) : null}
    </li>
  );
}
