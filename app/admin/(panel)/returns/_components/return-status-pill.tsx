import type { ReturnStatus } from "@/types/commerce/returns";
import { RETURN_STATUS_TONE, returnStatusLabel } from "@/utils/orders/return-display";

export function ReturnStatusPill({ status }: { status: ReturnStatus }) {
  return (
    <span className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-semibold ${RETURN_STATUS_TONE[status]}`}>{returnStatusLabel(status)}</span>
  );
}
