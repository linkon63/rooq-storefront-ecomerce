import type { ReturnReason, ReturnRequestResponse, ReturnStatus } from "@/types/commerce/returns";

export const RETURN_STATUS_TONE: Record<ReturnStatus, string> = {
  REQUESTED: "border-amber-300 bg-amber-50 text-amber-700",
  APPROVED: "border-sky-300 bg-sky-50 text-sky-700",
  REJECTED: "border-rose-300 bg-rose-50 text-rose-700",
  REFUNDED: "border-emerald-300 bg-emerald-50 text-emerald-700",
  EXCHANGED: "border-violet-300 bg-violet-50 text-violet-700",
  CANCELLED: "border-slate-300 bg-slate-50 text-slate-500",
};

export const RETURN_REASON_LABEL: Record<ReturnReason, string> = {
  TOO_SMALL: "Too small",
  TOO_LARGE: "Too large",
  NOT_AS_DESCRIBED: "Not as described",
  DAMAGED: "Damaged",
  WRONG_ITEM: "Wrong item",
  QUALITY: "Quality",
  CHANGED_MIND: "Changed mind",
  OTHER: "Other",
};

/** Button label for moving a return to `status`. */
export const RETURN_ACTION_LABEL: Record<ReturnStatus, string> = {
  REQUESTED: "Re-open",
  APPROVED: "Approve",
  REJECTED: "Reject",
  REFUNDED: "Mark refunded",
  EXCHANGED: "Mark exchanged",
  CANCELLED: "Cancel request",
};

export function returnStatusLabel(status: ReturnStatus): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

/** Σ unitPrice × qty — the refund the API defaults to. */
export function returnValue(request: Pick<ReturnRequestResponse, "items">): number {
  return Math.round(request.items.reduce((sum, item) => sum + item.orderItem.unitPrice * item.quantity, 0) * 100) / 100;
}

export function returnUnits(request: Pick<ReturnRequestResponse, "items">): number {
  return request.items.reduce((sum, item) => sum + item.quantity, 0);
}
