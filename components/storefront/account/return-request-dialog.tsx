"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { createReturn, getReturnable } from "@/lib/storefront/orders-api";
import type { Order, ReturnResolution, Returnable } from "@/types/storefront/commerce";
import { errorText } from "@/utils/api-error";
import { formatOrderDate } from "@/utils/storefront/orders";
import { returnPayload, type ReturnDraft } from "@/utils/storefront/returns";
import { Modal } from "../shared/modal";
import { ReturnItemRow } from "./return-item-row";

/** Customer return/exchange request for a delivered order: items, quantity, reason, refund or exchange. */
export function ReturnRequestDialog({ order, onClose }: { order: Order; onClose: () => void }) {
  const [returnable, setReturnable] = useState<Returnable | null>(null);
  const [resolution, setResolution] = useState<ReturnResolution>("REFUND");
  const [drafts, setDrafts] = useState<Record<string, ReturnDraft>>({});
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getReturnable(order.id)
      .then(setReturnable)
      .catch((caught) => setError(errorText(caught, ERROR_MESSAGES.storefront.returnNotEligible)));
  }, [order.id]);

  async function submit() {
    const built = returnPayload(order.id, resolution, note, drafts);
    if (typeof built === "string") return setError(built);
    setSending(true);
    setError(null);
    try {
      await createReturn(built);
      toast.success(SUCCESS_MESSAGES.storefront.returnRequested);
      onClose();
    } catch (caught) {
      setError(errorText(caught, ERROR_MESSAGES.storefront.returnFailed));
    } finally {
      setSending(false);
    }
  }

  const productIdFor = (orderItemId: string) => order.items.find((item) => item.id === orderItemId)?.productId ?? null;

  return (
    <Modal open onOpenChange={(open) => (open ? null : onClose())} title={`Return items from ${order.orderNumber}`}>
      <div className="flex flex-col gap-5 px-4 py-5 md:px-6">
        {!returnable && !error ? <div className="h-32 animate-pulse rounded bg-selvedge" aria-busy="true" /> : null}
        {returnable && !returnable.eligible ? (
          <p role="alert" className="text-dye-deep">
            {returnable.reason ?? ERROR_MESSAGES.storefront.returnNotEligible}
          </p>
        ) : null}
        {returnable?.eligible ? (
          <>
            {returnable.deadline ? <p className="text-sm text-stone">Request by {formatOrderDate(returnable.deadline)}.</p> : null}
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">What would you like?</legend>
              <div className="flex gap-2">
                {(["REFUND", "EXCHANGE"] as const).map((value) => (
                  <label key={value} className={`cursor-pointer rounded border px-4 py-2 text-sm font-semibold ${resolution === value ? "border-ink bg-ink text-chalk" : "border-line"}`}>
                    <input type="radio" name="resolution" className="sr-only" checked={resolution === value} onChange={() => setResolution(value)} />
                    {value === "REFUND" ? "A refund" : "A different size or colour"}
                  </label>
                ))}
              </div>
            </fieldset>
            <ul className="flex flex-col gap-3">
              {returnable.items.map((item) => (
                <ReturnItemRow
                  key={item.orderItemId}
                  item={item}
                  productId={productIdFor(item.orderItemId)}
                  exchange={resolution === "EXCHANGE"}
                  draft={drafts[item.orderItemId]}
                  onChange={(draft) => setDrafts((current) => ({ ...current, [item.orderItemId]: draft }))}
                />
              ))}
            </ul>
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Anything else we should know? <span className="font-normal text-stone">(optional)</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="rounded border border-line bg-paper px-3 py-2 text-base font-normal" />
            </label>
          </>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-dye-deep">
            {error}
          </p>
        ) : null}
        {returnable?.eligible ? (
          <button type="button" disabled={sending} onClick={() => void submit()} className="h-12 rounded bg-ink text-sm font-semibold text-chalk disabled:opacity-60">
            {sending ? "Sending…" : "Request return"}
          </button>
        ) : null}
      </div>
    </Modal>
  );
}
