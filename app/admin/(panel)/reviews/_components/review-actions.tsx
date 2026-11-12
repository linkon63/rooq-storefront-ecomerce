"use client";

import { AdminIcon } from "../../../_components/admin-shell";
import type { Review, ReviewStatus } from "@/types/admin/content";

type Props = {
  review: Review;
  busy: boolean;
  onModerate: (review: Review, status: ReviewStatus) => void;
  onDelete: (review: Review) => void;
};

const base = "grid h-8 w-8 cursor-pointer place-items-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export function ReviewActions({ review, busy, onModerate, onDelete }: Props) {
  return (
    <div className="flex gap-2">
      <button
        aria-label="Approve review"
        className={`${base} border-emerald-200 text-emerald-600 hover:bg-emerald-50`}
        disabled={busy || review.status === "APPROVED"}
        onClick={() => onModerate(review, "APPROVED")}
        title="Approve"
        type="button"
      >
        <AdminIcon className="h-4 w-4" name="check" />
      </button>
      <button
        aria-label="Reject review"
        className={`${base} border-amber-200 text-amber-600 hover:bg-amber-50`}
        disabled={busy || review.status === "REJECTED"}
        onClick={() => onModerate(review, "REJECTED")}
        title="Reject"
        type="button"
      >
        <AdminIcon className="h-4 w-4" name="x" />
      </button>
      <button
        aria-label="Delete review"
        className={`${base} border-red-100 text-red-500 hover:bg-red-50`}
        disabled={busy}
        onClick={() => onDelete(review)}
        title="Delete"
        type="button"
      >
        <AdminIcon className="h-4 w-4" name="trash" />
      </button>
    </div>
  );
}
