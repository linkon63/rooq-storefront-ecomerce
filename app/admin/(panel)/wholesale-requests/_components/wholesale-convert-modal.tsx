"use client";

import { useState, type FormEvent } from "react";
import type { OrderResponse as Order } from "@/types/commerce/order";
import type { WholesaleRequestResponse as WholesaleOrderRequest } from "@/types/commerce/wholesale";
import { formatMoney } from "@/utils/admin/format";
import { canSubmitConvert, convertTotals, type ConvertDraft } from "@/utils/orders/wholesale";
import { AdminIcon } from "../../../_components/admin-shell";
import { ConvertLineRow } from "./convert-line-row";

type Props = { request: WholesaleOrderRequest; symbol: string; busy: boolean; onClose: () => void; onConvert: (draft: ConvertDraft) => Promise<Order | string> };

function initialDraft(request: WholesaleOrderRequest): ConvertDraft {
  const addresses = request.user.addresses ?? [];
  return {
    addressId: (addresses.find((a) => a.isDefault) ?? addresses[0])?.id ?? "",
    discount: "0",
    shippingCost: "0",
    tax: "0",
    items: request.items.map((item) => ({
      requestItemId: item.id,
      label: [item.product?.name, item.variant ? `${item.variant.color.name} / ${item.variant.size.label}` : null].filter(Boolean).join(" — "),
      quantity: String(item.requestedQuantity),
      unitPrice: item.targetPrice !== null ? String(item.targetPrice) : "",
    })),
  };
}

const INPUT = "h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-blue-500 focus:bg-white";

export function WholesaleConvertModal({ request, symbol, busy, onClose, onConvert }: Props) {
  const [draft, setDraft] = useState<ConvertDraft>(() => initialDraft(request));
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Order | null>(null);
  const totals = convertTotals(draft);
  const addresses = request.user.addresses ?? [];
  const setField = (field: "discount" | "shippingCost" | "tax" | "addressId", value: string) => setDraft((d) => ({ ...d, [field]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const result = await onConvert(draft);
    if (typeof result === "string") setError(result);
    else setCreated(result);
  }

  return (
    <div aria-labelledby="wholesale-convert-title" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center overscroll-contain bg-slate-950/50 px-4 py-6" role="dialog">
      <form className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl" onSubmit={submit}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800" id="wholesale-convert-title">
              Convert to order
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Request {request.requestNumber} for {request.user.name}
            </p>
          </div>
          <button aria-label="Close" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300" disabled={busy} onClick={onClose} type="button">
            <AdminIcon className="h-5 w-5" name="x" />
          </button>
        </div>
        {created ? (
          <div className="space-y-5">
            <p className="rounded-lg bg-emerald-50 px-4 py-4 font-semibold text-emerald-700">Order {created.orderNumber} created — stock has been reserved.</p>
            <div className="flex justify-end">
              <button className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white" onClick={onClose} type="button">
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[600px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    {["Product", "Quantity", "Unit price", "Line total"].map((h) => (
                      <th className="px-4 py-3 text-sm font-semibold text-slate-700" key={h} scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {draft.items.map((line, index) => (
                    <ConvertLineRow
                      key={line.requestItemId}
                      line={line}
                      onChange={(field, value) => setDraft((d) => ({ ...d, items: d.items.map((l, i) => (i === index ? { ...l, [field]: value } : l)) }))}
                      symbol={symbol}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Delivery address</span>
              {addresses.length ? (
                <select className={INPUT} onChange={(e) => setField("addressId", e.target.value)} required value={draft.addressId}>
                  <option value="">Select an address</option>
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {[a.fullName, a.addressLine1, a.city, a.country].filter(Boolean).join(", ")}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">This customer has no saved addresses. Ask them to add one before converting.</p>
              )}
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              {(["discount", "shippingCost", "tax"] as const).map((field) => (
                <label className="block" key={field}>
                  <span className="mb-2 block text-sm font-semibold capitalize text-slate-700">{field === "shippingCost" ? "Shipping" : field}</span>
                  <input className={INPUT} inputMode="decimal" min={0} onChange={(e) => setField(field, e.target.value)} step="0.01" type="number" value={draft[field]} />
                </label>
              ))}
            </div>
            <dl className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(totals.subtotal, symbol)}</dd></div>
              <div className="flex justify-between"><dt>− Discount</dt><dd className="tabular-nums">{formatMoney(totals.discount, symbol)}</dd></div>
              <div className="flex justify-between"><dt>+ Shipping</dt><dd className="tabular-nums">{formatMoney(totals.shippingCost, symbol)}</dd></div>
              <div className="flex justify-between"><dt>+ Tax</dt><dd className="tabular-nums">{formatMoney(totals.tax, symbol)}</dd></div>
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 text-lg font-semibold text-slate-900"><dt>Grand total</dt><dd className="tabular-nums">{formatMoney(totals.grandTotal, symbol)}</dd></div>
            </dl>
            {error ? <p aria-live="polite" className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
            <div className="flex justify-end gap-3">
              <button className="h-11 rounded-lg border-2 border-slate-200 px-5 text-sm font-semibold text-slate-600" disabled={busy} onClick={onClose} type="button">
                Cancel
              </button>
              <button className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white disabled:bg-slate-400" disabled={busy || !canSubmitConvert(draft)} type="submit">
                {busy ? "Creating order…" : "Create order"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
