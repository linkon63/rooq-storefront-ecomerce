"use client";

import type { DragEvent } from "react";
import { resolveImageUrl } from "@/utils/admin/format";
import type { CategoryRow as Row, DropMode } from "@/utils/admin/category-tree";
import { formatDate } from "@/utils/format-date";
import { StatusToggle } from "../../../_components/admin-ui";
import { AdminIcon } from "../../../_components/admin-icons";
import { RowActions } from "../../../_components/list/row-actions";

type Props = {
  category: Row;
  canReorder: boolean;
  isDragging: boolean;
  indicator: DropMode | null;
  onDragStart: (event: DragEvent, id: string) => void;
  onDragOver: (event: DragEvent, id: string) => void;
  onDrop: (event: DragEvent, id: string) => void;
  onDragEnd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
};

const INDICATOR_CLASS: Record<DropMode, string> = {
  inside: "!bg-blue-50 ring-1 ring-inset ring-blue-300",
  before: "shadow-[inset_0_2px_0_0_#2563eb]",
  after: "shadow-[inset_0_-2px_0_0_#2563eb]",
};

export function CategoryRow({ category, canReorder, isDragging, indicator, onDragStart, onDragOver, onDrop, onDragEnd, onEdit, onDelete, onToggleActive }: Props) {
  return (
    <tr
      className={`transition-colors odd:bg-white even:bg-slate-50/70 ${isDragging ? "opacity-40" : ""} ${indicator ? INDICATOR_CLASS[indicator] : ""}`}
      onDragOver={canReorder ? (event) => onDragOver(event, category.id) : undefined}
      onDrop={canReorder ? (event) => onDrop(event, category.id) : undefined}
    >
      <td className="w-10 px-2 py-4 align-middle">
        <button
          aria-label={`Drag to reorder ${category.name}`}
          className={`grid h-8 w-6 place-items-center rounded-md text-slate-400 ${canReorder ? "cursor-grab hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing" : "cursor-not-allowed opacity-40"}`}
          draggable={canReorder}
          onDragEnd={onDragEnd}
          onDragStart={canReorder ? (event) => onDragStart(event, category.id) : undefined}
          title={canReorder ? "Drag to reorder or nest" : "Clear search to reorder categories"}
          type="button"
        >
          <AdminIcon className="h-4 w-4" name="grip" />
        </button>
      </td>
      <td className="px-5 py-4 text-sm text-slate-800">
        <span style={{ paddingLeft: `${category.depth * 18}px` }}>
          {category.depth > 0 ? "↳ " : ""}
          {category.name}
        </span>
      </td>
      <td className="px-5 py-4">
        {category.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- DB media thumbnail, already resized on upload
          <img alt="" className="h-12 w-12 rounded-lg border border-slate-200 object-cover" height={48} loading="lazy" src={resolveImageUrl(category.imageUrl)} width={48} />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-white">
            <AdminIcon className="h-5 w-5 text-slate-400" name="category" />
          </div>
        )}
      </td>
      <td className="px-5 py-4 text-sm text-slate-600">{category.slug}</td>
      <td className="px-5 py-4 text-sm text-slate-600">{category.parentName}</td>
      <td className="px-5 py-4 text-sm tabular-nums text-slate-600">{category.productCount ?? 0}</td>
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-2" title={category.isActive === false ? "Hidden from the website" : "Shown on the website"}>
          <StatusToggle checked={category.isActive !== false} onChange={onToggleActive} />
          <span className="text-xs font-medium text-slate-500">{category.isActive === false ? "Off" : "On"}</span>
        </span>
      </td>
      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(category.createdAt)}</td>
      <td className="px-5 py-4">
        <RowActions label={category.name} onDelete={onDelete} onEdit={onEdit} />
      </td>
    </tr>
  );
}
