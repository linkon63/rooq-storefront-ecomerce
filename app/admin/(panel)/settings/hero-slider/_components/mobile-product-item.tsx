"use client";

/* eslint-disable @next/next/no-img-element -- admin preview of an already-processed media URL */
import type { AdminHeroMobileProduct } from "@/types/admin/hero";
import { AdminIcon } from "../../../../_components/admin-icons";
import { MobilePhotoPicker } from "./mobile-photo-picker";

type Props = {
  item: AdminHeroMobileProduct;
  index: number;
  count: number;
  busy: boolean;
  onPhoto: (mediaId: string | null) => void;
  onMove: (step: -1 | 1) => void;
  onRemove: () => void;
};

const iconButton = "grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30";

/** One phone-hero pick: preview of the photo shown, which photo, its place in the order, remove. */
export function MobileProductItem({ item, index, count, busy, onPhoto, onMove, onRemove }: Props) {
  const shown = item.photo ?? item.photos[0] ?? null;
  return (
    <li className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <div className="relative aspect-4/5 overflow-hidden rounded-md bg-slate-50">
        {shown ? <img alt={shown.alt ?? item.product.name} className="h-full w-full object-cover" src={shown.url} /> : null}
        <span className="absolute left-2 top-2 rounded bg-slate-900/80 px-2 py-0.5 text-xs font-bold text-white">{index + 1}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex-1 truncate text-sm font-bold text-slate-800">{item.product.name}</span>
        <button type="button" aria-label="Move earlier" className={iconButton} disabled={busy || index === 0} onClick={() => onMove(-1)}>
          <AdminIcon className="h-4 w-4" name="arrow-left" />
        </button>
        <button type="button" aria-label="Move later" className={iconButton} disabled={busy || index === count - 1} onClick={() => onMove(1)}>
          <AdminIcon className="h-4 w-4" name="arrow-right" />
        </button>
        <button type="button" aria-label="Remove from phone hero" className={`${iconButton} text-red-600`} disabled={busy} onClick={onRemove}>
          <AdminIcon className="h-4 w-4" name="trash" />
        </button>
      </div>
      <MobilePhotoPicker photos={item.photos} selectedId={item.photo?.id ?? null} busy={busy} onSelect={onPhoto} />
      {item.product.status !== "active" ? (
        <p className="text-xs font-semibold text-amber-700">This product is not active, so phones skip it.</p>
      ) : null}
    </li>
  );
}
