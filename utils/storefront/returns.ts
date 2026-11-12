import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { ReturnReason, ReturnRequestInput, ReturnResolution } from "@/types/storefront/commerce";

/** One line of the return form while it is being filled in. */
export type ReturnDraft = {
  selected: boolean;
  quantity: number;
  reason: ReturnReason;
  note: string;
  exchangeVariantId: string | null;
};

export const EMPTY_RETURN_DRAFT: ReturnDraft = {
  selected: false,
  quantity: 1,
  reason: "TOO_SMALL",
  note: "",
  exchangeVariantId: null,
};

/** Drafts → POST /returns body, or the message explaining what is missing. */
export function returnPayload(
  orderId: string,
  resolution: ReturnResolution,
  customerNote: string,
  drafts: Record<string, ReturnDraft>,
): ReturnRequestInput | string {
  const chosen = Object.entries(drafts).filter(([, draft]) => draft.selected && draft.quantity > 0);
  if (chosen.length === 0) return ERROR_MESSAGES.returns.itemRequired;
  if (resolution === "EXCHANGE" && chosen.some(([, draft]) => !draft.exchangeVariantId)) {
    return ERROR_MESSAGES.returns.exchangeVariantRequired;
  }
  return {
    orderId,
    resolution,
    customerNote: customerNote.trim() || undefined,
    items: chosen.map(([orderItemId, draft]) => ({
      orderItemId,
      quantity: draft.quantity,
      reason: draft.reason,
      note: draft.note.trim() || undefined,
      exchangeVariantId: resolution === "EXCHANGE" ? (draft.exchangeVariantId ?? undefined) : undefined,
    })),
  };
}
