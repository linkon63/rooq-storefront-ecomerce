import Link from "next/link";
import { COPY } from "@/lib/constants/storefront-copy";
import type { ReviewWithProduct } from "@/types/storefront/commerce";
import { CrossStitch } from "../shared/cross-stitch";
import { SectionHeading } from "../shared/section-heading";
import { StarRating } from "../shared/star-rating";

/** Each note hangs at its own slight angle (degrees), repeating down the list. */
const TILTS = [-1.4, 0.9, -0.6, 1.2, -1, 0.5];

/**
 * Newest approved reviews across the shop, each linking to its product,
 * shown as paper notes sewn to the page with a cross stitch. A note
 * straightens and lifts when pointed at.
 */
export async function ReviewsShowcase({ reviews }: { reviews: ReviewWithProduct[] }) {
  const t = COPY;
  return (
    <section aria-labelledby="reviews-title" className="page-gutter">
      <SectionHeading id="reviews-title" title={t.home.reviewsTitle} />
      {reviews.length === 0 ? (
        <p className="type-lead max-w-[52ch] text-stone">
          {t.home.reviewsEmpty}
        </p>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {reviews.map((review, index) => (
            <li
              key={review.id}
              style={{ rotate: `${TILTS[index % TILTS.length]}deg` }}
              className="review-note relative flex flex-col gap-3 p-6 pt-8"
            >
              <CrossStitch className="absolute left-3 top-3 size-4" />
              <CrossStitch className="absolute right-3 top-3 size-4" />
              <StarRating rating={review.rating} />
              {review.title ? <h3 className="type-h3">{review.title}</h3> : null}
              {review.comment ? <p className="type-body line-clamp-5 whitespace-pre-line">{review.comment}</p> : null}
              <p className="type-meta mt-auto text-stone">
                {review.user.name} {t.home.reviewOn}{" "}
                <Link href={`/product/${review.product.slug}`} className="underline underline-offset-4 hover:text-ink">
                  {review.product.name}
                </Link>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
