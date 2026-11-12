"use client";

import type { AdminColor, AdminProductMedia } from "@/types/catalog-admin";
import { AdminIcon } from "../../../_components/admin-icons";
import { IconButton } from "../../_catalog/button";
import { inputClass } from "../../_catalog/field";

type Props = {
  item: AdminProductMedia;
  colors: AdminColor[];
  first: boolean;
  last: boolean;
  onColor: (colorId: string | null) => void;
  onPrimary: () => void;
  onMove: (step: -1 | 1) => void;
  onDelete: () => void;
};

export function GalleryItem({ item, colors, first, last, onColor, onPrimary, onMove, onDelete }: Props) {
  return (
    <li className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.url} alt={item.alt ?? ""} className="aspect-[3/4] w-full rounded object-cover" loading="lazy" />
        {item.isPrimary ? <span className="absolute left-1.5 top-1.5 rounded bg-slate-900/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">Main</span> : null}
      </div>
      <select aria-label="Colour this image shows" className={`${inputClass} h-8 text-xs`} value={item.colorId ?? ""} onChange={(e) => onColor(e.target.value || null)}>
        <option value="">All colours</option>
        {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div className="flex items-center justify-between">
        <IconButton label="Move earlier" disabled={first} onClick={() => onMove(-1)}><AdminIcon className="h-4 w-4" name="arrow-left" /></IconButton>
        <IconButton label="Use as main image for this colour" disabled={item.isPrimary} onClick={onPrimary}><AdminIcon className="h-4 w-4" name="check" /></IconButton>
        <IconButton label="Remove image" onClick={onDelete}><AdminIcon className="h-4 w-4" name="trash" /></IconButton>
        <IconButton label="Move later" disabled={last} onClick={() => onMove(1)}><AdminIcon className="h-4 w-4" name="arrow-right" /></IconButton>
      </div>
    </li>
  );
}
