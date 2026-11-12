import { REVIEW_STATUS_LABELS } from "@/lib/constants/content";
import type { ReviewStatus } from "@/types/admin/content";

const TONES: Record<ReviewStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[status]}`}>
      {REVIEW_STATUS_LABELS[status]}
    </span>
  );
}
