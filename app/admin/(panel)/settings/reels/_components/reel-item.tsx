"use client";

import type { AdminReel } from "@/types/admin/reel";
import { AdminIcon } from "../../../../_components/admin-icons";
import { StatusToggle } from "../../_components/settings-ui";
import { ReelProductField } from "./reel-product-field";

type Props = {
  reel: AdminReel;
  index: number;
  count: number;
  busy: boolean;
  onUpdate: (patch: { productId?: string; isActive?: boolean }) => void;
  onMove: (step: -1 | 1) => void;
  onRemove: () => void;
};

const iconButton = "grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30";

/** One reel: preview, position, show/hide, the product it opens, delete. */
export function ReelItem({ reel, index, count, busy, onUpdate, onMove, onRemove }: Props) {
  return (
    <li className={`flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 ${reel.isActive ? "" : "opacity-60"}`}>
      <video src={reel.videoUrl} controls muted playsInline preload="metadata" className="aspect-[9/16] w-full rounded-md bg-slate-100 object-contain" />
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Move earlier" className={iconButton} disabled={busy || index === 0} onClick={() => onMove(-1)}>
          <AdminIcon className="h-4 w-4" name="arrow-left" />
        </button>
        <button type="button" aria-label="Move later" className={iconButton} disabled={busy || index === count - 1} onClick={() => onMove(1)}>
          <AdminIcon className="h-4 w-4" name="arrow-right" />
        </button>
        <span className="ml-auto flex items-center gap-2 text-xs font-bold text-slate-500">
          {reel.isActive ? "Shown" : "Hidden"}
          <StatusToggle active={reel.isActive} onChange={(isActive) => onUpdate({ isActive })} />
        </span>
        <button type="button" aria-label="Delete reel" className={`${iconButton} text-red-600`} disabled={busy} onClick={onRemove}>
          <AdminIcon className="h-4 w-4" name="trash" />
        </button>
      </div>
      {/* A reel always has a product: "Unlink" opens the search, picking one saves it. */}
      <ReelProductField reel={reel} busy={busy} onUpdate={onUpdate} />
      {reel.product.status !== "active" ? <p className="text-xs font-semibold text-amber-700">This product is not active, so the reel is hidden.</p> : null}
    </li>
  );
}
