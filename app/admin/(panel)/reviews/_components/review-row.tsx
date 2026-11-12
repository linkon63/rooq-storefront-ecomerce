"use client";

import type { Review, ReviewStatus } from "@/types/admin/content";
import { formatDate } from "@/utils/format-date";
import { ReviewActions } from "./review-actions";
import { ReviewContent } from "./review-content";
import { ReviewStatusBadge } from "./review-status-badge";
import { StarRating } from "./star-rating";

type Props = {
  review: Review;
  busy: boolean;
  onModerate: (review: Review, status: ReviewStatus) => void;
  onDelete: (review: Review) => void;
};

export function ReviewRow({ review, busy, onModerate, onDelete }: Props) {
  return (
    <tr className="align-top transition-colors hover:bg-blue-50/30">
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">{review.user?.name ?? "—"}</p>
        {review.user?.email && <p className="text-xs text-slate-500">{review.user.email}</p>}
        <p className="mt-1 text-xs text-slate-400">{formatDate(review.createdAt)}</p>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{review.product?.name ?? "—"}</td>
      <td className="px-4 py-3">
        <StarRating rating={review.rating} />
      </td>
      <td className="px-4 py-3">
        <ReviewContent review={review} />
      </td>
      <td className="px-4 py-3">
        <ReviewStatusBadge status={review.status} />
      </td>
      <td className="px-4 py-3">
        <ReviewActions busy={busy} onDelete={onDelete} onModerate={onModerate} review={review} />
      </td>
    </tr>
  );
}
