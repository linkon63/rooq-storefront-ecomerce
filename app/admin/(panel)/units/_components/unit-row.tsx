"use client";

import Link from "next/link";
import type { Unit } from "@/types/admin/catalog";
import { unitChainLabel } from "@/utils/admin/units";
import { formatDate } from "@/utils/format-date";
import { AdminIcon } from "../../../_components/admin-icons";
import { RowActions } from "../../../_components/list/row-actions";

export function UnitRow({ unit, all, onDelete }: { unit: Unit; all: Unit[]; onDelete: () => void }) {
  return (
    <tr className="odd:bg-white even:bg-slate-50/70">
      <td className="px-5 py-4 text-sm text-slate-800">{unit.name}</td>
      <td className="px-5 py-4">
        <span className="rounded-md border border-slate-200/50 bg-slate-50 px-2 py-0.5 text-xs font-normal text-slate-600">{unit.code}</span>
      </td>
      <td className="px-5 py-4 text-sm text-slate-600">
        {unit.parentUnit ? (
          `${unit.parentUnit.name} (${unit.parentUnit.code})`
        ) : (
          <span className="rounded-md border border-blue-200 bg-blue-50/50 px-2 py-0.5 text-xs text-blue-700">Base unit</span>
        )}
      </td>
      <td className="px-5 py-4 text-sm text-slate-600">{unitChainLabel(unit, all)}</td>
      <td className="px-5 py-4 text-sm tabular-nums text-slate-600">{unit._count?.products ?? 0}</td>
      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(unit.createdAt)}</td>
      <td className="px-5 py-4">
        <span className={`rounded-md border px-2 py-0.5 text-xs font-normal ${unit.isActive ? "border-emerald-200 bg-emerald-50/50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
          {unit.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-5 py-4">
        <RowActions label={unit.name} onDelete={onDelete}>
          <Link
            aria-label={`Edit ${unit.name}`}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100"
            href={`/admin/units/${unit.id}/edit`}
            title={`Edit ${unit.name}`}
          >
            <AdminIcon className="h-4 w-4" name="edit" />
          </Link>
        </RowActions>
      </td>
    </tr>
  );
}
