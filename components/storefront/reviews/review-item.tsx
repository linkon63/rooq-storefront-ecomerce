import Image from "next/image";
import { FIT_FEEDBACK_LABELS } from "@/lib/constants/storefront";
import type { Review } from "@/types/storefront/commerce";
import { formatReviewDate } from "@/utils/storefront/reviews";
import { LabelTag } from "../shared/label-tag";
import { StarRating } from "../shared/star-rating";

export function ReviewItem({ review }: { review: Review }) {
  return (
    <article className="flex flex-col gap-2 border-b border-selvedge py-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <StarRating rating={review.rating} />
        {review.fitFeedback ? <LabelTag tone="paper">{FIT_FEEDBACK_LABELS[review.fitFeedback]}</LabelTag> : null}
      </div>
      {review.title ? <h3 className="font-semibold">{review.title}</h3> : null}
      {review.comment ? <p className="max-w-[68ch] whitespace-pre-line text-[0.9375rem] leading-relaxed">{review.comment}</p> : null}
      {review.photos.length ? (
        <ul className="mt-1 flex flex-wrap gap-2">
          {review.photos.map((photo) => (
            <li key={photo.id} className="relative size-20 overflow-hidden rounded-sm bg-selvedge">
              <Image src={photo.url} alt={photo.alt ?? `Photo from ${review.user.name}`} fill sizes="80px" className="object-cover" />
            </li>
          ))}
        </ul>
      ) : null}
      <p className="text-sm text-stone">
        {review.user.name}
        {review.variant ? `, wears ${review.variant.size} in ${review.variant.color}` : ""}
        {review.isVerifiedPurchase ? ", verified buyer" : ""}
        <span className="block text-xs">{formatReviewDate(review.createdAt)}</span>
      </p>
    </article>
  );
}
