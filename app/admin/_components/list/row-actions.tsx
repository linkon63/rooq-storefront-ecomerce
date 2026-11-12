"use client";

import type { ReactNode } from "react";
import { AdminIcon } from "../admin-icons";

type Props = { label: string; onEdit?: () => void; onDelete?: () => void; children?: ReactNode };

/** Edit / delete icon buttons at the end of an admin table row. */
export function RowActions({ label, onEdit, onDelete, children }: Props) {
  return (
    <div className="flex gap-2">
      {children}
      {onEdit ? (
        <button
          aria-label={`Edit ${label}`}
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100"
          onClick={onEdit}
          title={`Edit ${label}`}
          type="button"
        >
          <AdminIcon className="h-4 w-4" name="edit" />
        </button>
      ) : null}
      {onDelete ? (
        <button
          aria-label={`Delete ${label}`}
          className="grid h-8 w-8 place-items-center rounded-lg border border-red-100 text-red-500 transition-colors hover:bg-red-50"
          onClick={onDelete}
          title={`Delete ${label}`}
          type="button"
        >
          <AdminIcon className="h-4 w-4" name="trash" />
        </button>
      ) : null}
    </div>
  );
}
