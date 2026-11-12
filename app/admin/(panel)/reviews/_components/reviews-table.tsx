"use client";

import type { Review, ReviewStatus } from "@/types/admin/content";
import { REVIEW_COLUMNS } from "./review-columns";
import { ReviewRow } from "./review-row";

type Props = {
  reviews: Review[];
  busyId: string | null;
  onModerate: (review: Review, status: ReviewStatus) => void;
  onDelete: (review: Review) => void;
};

export function ReviewsTable({ reviews, busyId, onModerate, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] text-left">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            {REVIEW_COLUMNS.map((heading) => (
              <th className="px-4 py-2.5 text-sm font-semibold text-slate-700" key={heading} scope="col">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reviews.map((review) => (
            <ReviewRow
              busy={busyId === review.id}
              key={review.id}
              onDelete={onDelete}
              onModerate={onModerate}
              review={review}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
