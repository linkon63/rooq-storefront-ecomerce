"use client";

import Image from "next/image";
import { RETURN_REASON_LABELS } from "@/lib/constants/storefront";
import type { ReturnReason, ReturnableItem } from "@/types/storefront/commerce";
import { variantCaption } from "@/utils/storefront/orders";
import { EMPTY_RETURN_DRAFT, type ReturnDraft } from "@/utils/storefront/returns";
import { ExchangeVariantSelect } from "./exchange-variant-select";

type Props = {
  item: ReturnableItem;
  productId: string | null;
  exchange: boolean;
  draft: ReturnDraft | undefined;
  onChange: (draft: ReturnDraft) => void;
};

const fieldClass = "h-10 rounded border border-line bg-paper px-2 text-sm";

export function ReturnItemRow({ item, productId, exchange, draft = EMPTY_RETURN_DRAFT, onChange }: Props) {
  const disabled = item.returnableQuantity < 1;
  const set = (patch: Partial<ReturnDraft>) => onChange({ ...draft, ...patch });
  const id = `return-${item.orderItemId}`;

  return (
    <li className={`rounded border p-3 ${draft.selected ? "border-ink" : "border-line"} ${disabled ? "opacity-60" : ""}`}>
      <label htmlFor={id} className="flex cursor-pointer items-center gap-3">
        <input id={id} type="checkbox" disabled={disabled} checked={draft.selected} onChange={(event) => set({ selected: event.target.checked })} className="size-4 accent-[var(--color-ink)]" />
        <span className="relative aspect-[3/4] w-10 shrink-0 overflow-hidden bg-selvedge">
          {item.image ? <Image src={item.image} alt="" fill sizes="40px" className="object-cover" /> : null}
        </span>
        <span className="flex-1 text-sm">
          <span className="block font-medium">{item.productName}</span>
          <span className="text-stone">
            {variantCaption(item.colorName, item.sizeLabel)}. {disabled ? "Already returned" : `Up to ${item.returnableQuantity} can be returned`}
          </span>
        </span>
      </label>
      {draft.selected ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-[6rem_1fr]">
          <label className="flex flex-col gap-1 text-xs text-stone">
            Quantity
            <select value={draft.quantity} onChange={(event) => set({ quantity: Number(event.target.value) })} className={fieldClass}>
              {Array.from({ length: item.returnableQuantity }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-stone">
            Reason
            <select value={draft.reason} onChange={(event) => set({ reason: event.target.value as ReturnReason })} className={fieldClass}>
              {(Object.keys(RETURN_REASON_LABELS) as ReturnReason[]).map((reason) => (
                <option key={reason} value={reason}>
                  {RETURN_REASON_LABELS[reason]}
                </option>
              ))}
            </select>
          </label>
          {exchange && productId ? (
            <div className="sm:col-span-2">
              <ExchangeVariantSelect productId={productId} value={draft.exchangeVariantId} onChange={(exchangeVariantId) => set({ exchangeVariantId })} />
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
