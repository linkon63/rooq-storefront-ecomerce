import Link from "next/link";
import { PRODUCT_STATUS_LABELS } from "@/lib/constants/catalog";
import { formatMoney } from "@/utils/admin/format";
import type { AdminProductRow } from "@/types/catalog-admin";
import { AdminIcon } from "../../../_components/admin-icons";
import { Button, IconButton } from "../../_catalog/button";
import { StatusPill } from "../../_catalog/table";
import { Swatch } from "../../_catalog/swatch";

const STATUS_TONE = { active: "green", inactive: "slate", draft: "amber" } as const;

export function ProductListRow({ product, onArchive, onRestore }: { product: AdminProductRow; onArchive: () => void; onRestore: () => void }) {
  return (
    <tr className="odd:bg-white even:bg-slate-50/60">
      <td className="px-4 py-3">
        <Link href={`/admin/products/${product.id}/edit`} className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {product.image ? <img src={product.image.url} alt="" className="h-14 w-11 rounded object-cover" loading="lazy" /> : <span className="h-14 w-11 rounded bg-slate-100" />}
          <span>
            <span className="block font-medium text-slate-900 hover:text-blue-700">{product.name}</span>
            <span className="block text-xs text-slate-500">{product.styleCode ?? product.slug}</span>
          </span>
        </Link>
      </td>
      <td className="px-4 py-3 text-slate-600">{product.brand.name}<span className="block text-xs text-slate-500">{product.category.name}</span></td>
      <td className="px-4 py-3 tabular-nums">
        <span className="font-semibold text-slate-900">{formatMoney(product.price)}</span>
        {product.compareAtPrice ? <span className="ml-1 text-xs text-slate-400 line-through">{formatMoney(product.compareAtPrice)}</span> : null}
      </td>
      <td className="px-4 py-3">
        <span className="flex items-center gap-1">{product.colors.slice(0, 6).map((c) => <Swatch key={c.id} size="sm" hex={c.hex} name={c.name} />)}</span>
        <span className="mt-1 block text-xs text-slate-500">{product.variantCount} variants · {product.sizes.map((s) => s.label).join(" ")}</span>
      </td>
      <td className="px-4 py-3 tabular-nums">
        <span className="font-semibold text-slate-900">{product.totalStock}</span>
        {product.lowStockVariantCount ? <span className="block text-xs text-amber-700">{product.lowStockVariantCount} low</span> : null}
      </td>
      <td className="px-4 py-3">
        {product.archivedAt ? <StatusPill tone="red">Archived</StatusPill> : <StatusPill tone={STATUS_TONE[product.status]}>{PRODUCT_STATUS_LABELS[product.status]}</StatusPill>}
      </td>
      <td className="px-4 py-3">
        <span className="flex items-center justify-end gap-1">
          <Link aria-label={`Edit ${product.name}`} title="Edit" href={`/admin/products/${product.id}/edit`} className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><AdminIcon className="h-4 w-4" name="edit" /></Link>
          {product.archivedAt ? (
            <Button tone="secondary" className="h-8" onClick={onRestore}>Restore</Button>
          ) : (
            <IconButton label={`Archive ${product.name}`} onClick={onArchive}><AdminIcon className="h-4 w-4" name="trash" /></IconButton>
          )}
        </span>
      </td>
    </tr>
  );
}
