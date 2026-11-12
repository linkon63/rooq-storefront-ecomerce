import { FIT_FEEDBACK_LABELS } from "@/lib/constants/content";
import type { Review } from "@/types/admin/content";

/** Title, comment, fit + "wears" line and photo thumbnails of one review. */
export function ReviewContent({ review }: { review: Review }) {
  const details = [
    review.fitFeedback ? FIT_FEEDBACK_LABELS[review.fitFeedback] : null,
    review.variant ? `Bought ${review.variant.size} · ${review.variant.color}` : null,
    review.isVerifiedPurchase ? "Verified purchase" : null,
  ].filter(Boolean);

  return (
    <div className="max-w-md space-y-1">
      {review.title && <p className="text-sm font-semibold text-slate-800">{review.title}</p>}
      <p className="line-clamp-3 text-sm text-slate-600">{review.comment ?? "—"}</p>
      {details.length > 0 && <p className="text-xs font-medium text-slate-500">{details.join(" · ")}</p>}
      {review.photos.length > 0 && (
        <div className="flex gap-1.5 pt-1">
          {review.photos.map((photo) => (
            <a href={photo.url} key={photo.id} rel="noreferrer" target="_blank">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={photo.alt ?? "Review photo"}
                className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                height={40}
                loading="lazy"
                src={photo.url}
                width={40}
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
