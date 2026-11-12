"use client";

import type { Brand } from "@/types/admin/catalog";
import { resolveImageUrl } from "@/utils/admin/format";
import { formatDate } from "@/utils/format-date";
import { AdminIcon } from "../../../_components/admin-icons";
import { RowActions } from "../../../_components/list/row-actions";

export function BrandRow({ brand, onEdit, onDelete }: { brand: Brand; onEdit: () => void; onDelete: () => void }) {
  return (
    <tr className="odd:bg-white even:bg-slate-50/70">
      <td className="px-5 py-4 text-sm text-slate-800">{brand.name}</td>
      <td className="px-5 py-4">
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- DB media thumbnail, already resized on upload
          <img alt="" className="h-12 w-12 rounded-lg border border-slate-200 object-cover" height={48} loading="lazy" src={resolveImageUrl(brand.logoUrl)} width={48} />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-lg border border-slate-200 bg-white">
            <AdminIcon className="h-5 w-5 text-slate-400" name="brand" />
          </div>
        )}
      </td>
      <td className="px-5 py-4 text-sm text-slate-600">{brand.slug}</td>
      <td className="px-5 py-4 text-sm tabular-nums text-slate-600">{brand.productCount ?? 0}</td>
      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(brand.createdAt)}</td>
      <td className="px-5 py-4">
        <RowActions label={brand.name} onDelete={onDelete} onEdit={onEdit} />
      </td>
    </tr>
  );
}
