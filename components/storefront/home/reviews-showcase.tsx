import Link from "next/link";
import { getMessages } from "@/lib/i18n/server";
import type { ReviewWithProduct } from "@/types/storefront/commerce";
import { SectionHeading } from "../shared/section-heading";
import { StarRating } from "../shared/star-rating";

/** Newest approved reviews across the shop, each linking to its product. */
export async function ReviewsShowcase({ reviews }: { reviews: ReviewWithProduct[] }) {
  const { t } = await getMessages();
  return (
    <section aria-labelledby="reviews-title" className="page-gutter">
      <SectionHeading id="reviews-title" title={t.home.reviewsTitle} />
      {reviews.length === 0 ? (
        <p className="type-lead max-w-[52ch] text-stone">
          {t.home.reviewsEmpty}
        </p>
      ) : (
        <ul className="grid gap-[3px] md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-3 bg-selvedge/30 p-6">
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
