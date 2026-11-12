import type { WholesaleRequestStatus } from "@/types/commerce/wholesale";
import { humanize } from "@/utils/orders/display";

const TONE: Record<WholesaleRequestStatus, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-700",
  info_requested: "border-sky-300 bg-sky-50 text-sky-700",
  approved: "border-emerald-300 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-300 bg-rose-50 text-rose-700",
  converted: "border-violet-300 bg-violet-50 text-violet-700",
};

export function WholesaleStatusPill({ status }: { status: WholesaleRequestStatus }) {
  return <span className={`inline-block rounded-md border px-3 py-1 text-sm font-semibold capitalize ${TONE[status]}`}>{humanize(status)}</span>;
}
