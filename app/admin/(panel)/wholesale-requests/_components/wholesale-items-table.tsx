import type { WholesaleRequestResponse as WholesaleOrderRequest } from "@/types/commerce/wholesale";
import { formatMoney } from "@/utils/admin/format";

export function WholesaleItemsTable({ request, symbol }: { request: WholesaleOrderRequest; symbol: string }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {["Product", "Size / colour", "Requested", "Target price", "List price", "Note"].map((h) => (
              <th className="px-4 py-3 font-semibold text-slate-700" key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {request.items.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 font-semibold text-slate-800">{item.product?.name ?? "—"}</td>
              <td className="px-4 py-3 text-slate-600">
                {item.variant ? `${item.variant.color.name} / ${item.variant.size.label} · ${item.variant.sku}` : "Default variant"}
              </td>
              <td className="px-4 py-3 tabular-nums">{item.requestedQuantity}</td>
              <td className="px-4 py-3 tabular-nums">{item.targetPrice !== null ? formatMoney(item.targetPrice, symbol) : "—"}</td>
              <td className="px-4 py-3 tabular-nums text-slate-500">{formatMoney(item.variant?.price ?? item.product?.price ?? null, symbol)}</td>
              <td className="px-4 py-3 text-slate-600">{item.note ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
