import type { OrderResultItem } from "@/types/storefront/ui";
import { isDiscounted, unitListPrice } from "@/utils/cart-pricing";

export function InvoiceItems({ items, money }: { items: OrderResultItem[]; money: (value: number) => string }) {
  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-y border-stone-300 bg-stone-50 text-[10px] font-bold uppercase tracking-[0.12em] text-ink">
            <th className="w-10 px-3 py-2.5 text-center" scope="col">#</th>
            <th className="px-3 py-2.5" scope="col">Description</th>
            <th className="px-3 py-2.5 text-center" scope="col">Qty</th>
            <th className="px-3 py-2.5 text-right" scope="col">Unit Price</th>
            <th className="px-3 py-2.5 text-right" scope="col">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 text-xs text-stone-800">
          {items.map((item, index) => (
            <tr key={`${item.name}-${index}`}>
              <td className="px-3 py-3 text-center text-stone-400">{index + 1}</td>
              <td className="px-3 py-3">
                <p className="font-semibold text-stone-900">{item.name}</p>
                {item.sku || item.options?.length ? (
                  <p className="mt-0.5 text-[11px] text-stone-500">{[item.sku && `SKU: ${item.sku}`, ...(item.options ?? [])].filter(Boolean).join(" | ")}</p>
                ) : null}
              </td>
              <td className="px-3 py-3 text-center tabular-nums">{item.quantity}</td>
              <td className="px-3 py-3 text-right tabular-nums">
                {isDiscounted(item) ? <span className="mr-1.5 text-stone-400 line-through">{money(unitListPrice(item))}</span> : null}
                {money(item.price)}
              </td>
              <td className="px-3 py-3 text-right font-semibold tabular-nums text-ink">{money(unitListPrice(item) * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
