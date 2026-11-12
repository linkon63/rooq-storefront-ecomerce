import Image from "next/image";
import type { ReturnRequestResponse } from "@/types/commerce/returns";
import { formatMoney } from "@/utils/admin/format";
import { RETURN_REASON_LABEL } from "@/utils/orders/return-display";
import { lineOptions } from "@/utils/orders/display";

export function ReturnItemList({ request, symbol }: { request: ReturnRequestResponse; symbol: string }) {
  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
      {request.items.map((item) => (
        <li className="flex gap-4 p-4" key={item.id}>
          {item.orderItem.image ? (
            <Image alt={item.orderItem.productName} className="h-16 w-14 shrink-0 rounded-md object-cover" height={64} src={item.orderItem.image} width={56} />
          ) : (
            <span aria-hidden className="h-16 w-14 shrink-0 rounded-md bg-slate-100" />
          )}
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold text-slate-800">{item.orderItem.productName}</p>
            <p className="text-xs text-slate-500">
              {lineOptions(item.orderItem)} · SKU {item.orderItem.sku} · {item.quantity} of {item.orderItem.quantity} · {formatMoney(item.orderItem.unitPrice, symbol)} each
            </p>
            <p className="mt-1 text-xs">
              <span className="font-semibold text-slate-700">{RETURN_REASON_LABEL[item.reason]}</span>
              {item.note ? <span className="text-slate-500"> — {item.note}</span> : null}
            </p>
            {item.exchangeVariant ? (
              <p className="mt-1 text-xs text-violet-700">
                Wants instead: {item.exchangeVariant.color.name} / {item.exchangeVariant.size.label} ({item.exchangeVariant.sku})
              </p>
            ) : null}
          </div>
          {item.restocked ? <span className="h-fit rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Restocked</span> : null}
        </li>
      ))}
    </ul>
  );
}
