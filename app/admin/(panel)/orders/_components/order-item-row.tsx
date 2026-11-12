import Image from "next/image";
import type { OrderItemResponse as OrderItem } from "@/types/commerce/order";
import { formatMoney } from "@/utils/admin/format";
import { lineOptions } from "@/utils/orders/display";

/** One line, read off the order's snapshot — what was charged, even if the product changed since. */
export function OrderItemRow({ item, symbol }: { item: OrderItem; symbol: string }) {
  const discounted = item.listPrice > item.unitPrice;
  const options = lineOptions(item);

  return (
    <li className="flex items-center gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
      {item.imageUrl ? (
        <Image alt={item.productName} className="h-14 w-12 shrink-0 rounded-md border border-slate-100 bg-white object-cover" height={56} src={item.imageUrl} width={48} />
      ) : (
        <span aria-hidden className="h-14 w-12 shrink-0 rounded-md bg-slate-100" />
      )}
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-xs font-semibold text-slate-800">{item.productName}</h4>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          {item.colorHex ? (
            <span aria-hidden className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: item.colorHex }} />
          ) : null}
          {options ? <span className="font-medium text-slate-600">{options}</span> : null}
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">SKU {item.sku}</span>
          <span className="tabular-nums">
            {item.quantity} ×{" "}
            {discounted ? <span className="text-slate-400 line-through">{formatMoney(item.listPrice, symbol)}</span> : null}{" "}
            <span className={discounted ? "font-semibold text-slate-700" : undefined}>{formatMoney(item.unitPrice, symbol)}</span>
          </span>
          {item.variant && !item.variant.isActive ? (
            <span className="rounded border border-slate-200 px-1.5 text-[10px] font-semibold text-slate-400">Archived variant</span>
          ) : null}
        </div>
      </div>
      <div className="text-right tabular-nums">
        <p className="text-xs font-semibold text-slate-800">{formatMoney(item.totalPrice, symbol)}</p>
        {item.discountAmount > 0 ? <p className="text-[10px] font-semibold text-emerald-600">saved {formatMoney(item.discountAmount, symbol)}</p> : null}
      </div>
    </li>
  );
}
