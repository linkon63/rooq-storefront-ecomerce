"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { REVIEWS_PAGE_SIZE } from "@/lib/constants/storefront";
import { listReviews, type ReviewPage } from "@/lib/shop-api";
import type { SizeRef, VariantPublic } from "@/types/storefront/catalog";
import type { ReviewSort } from "@/types/storefront/commerce";
import { errorText } from "@/utils/api-error";
import { ReviewItem } from "./review-item";
import { ReviewSummary } from "./review-summary";

const ReviewForm = dynamic(() => import("./review-form").then((module) => module.ReviewForm), { ssr: false });

const SORTS: { value: ReviewSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "rating_desc", label: "Highest rated" },
  { value: "rating_asc", label: "Lowest rated" },
];

/** Just what the review list and form need (keeps the client payload small). */
export type ReviewProduct = {
  id: string;
  name: string;
  colors: { id: string; name: string }[];
  sizes: SizeRef[];
  variants: VariantPublic[];
};

type Props = { product: ReviewProduct };

/** Reviews: summary with fit meter, sortable list with photos, and the write-a-review form. */
export function ReviewsSection({ product }: Props) {
  const { isSignedIn, openAuth } = useSession();
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [page, setPage] = useState<ReviewPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);

  const load = useCallback(
    async (pageNumber: number, append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const next = await listReviews(product.id, { page: pageNumber, limit: REVIEWS_PAGE_SIZE, sort });
        setPage((current) => (append && current ? { ...next, data: [...current.data, ...next.data] } : next));
      } catch (caught) {
        setError(errorText(caught, ERROR_MESSAGES.storefront.reviewsLoadFailed));
      } finally {
        setLoading(false);
      }
    },
    [product.id, sort],
  );

  useEffect(() => {
    void load(1, false);
  }, [load]);

  const hasMore = page ? page.meta.page < page.meta.totalPages : false;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-title" className="font-wide text-[1.375rem] font-bold md:text-3xl">
          Reviews
        </h2>
        <button
          type="button"
          onClick={() => (isSignedIn ? setWriting(true) : openAuth("login"))}
          className="h-11 rounded border border-ink px-5 text-sm font-semibold hover:bg-ink hover:text-chalk"
        >
          Write a review
        </button>
      </div>
      {page && page.summary.count > 0 ? <ReviewSummary summary={page.summary} /> : null}
      {writing ? (
        <ReviewForm product={product} onClose={() => setWriting(false)} onPosted={() => void load(1, false)} />
      ) : null}
      {page && page.data.length > 0 ? (
        <>
          <div className="mt-8 flex items-center justify-end gap-2 text-sm">
            <label htmlFor="review-sort" className="text-stone">
              Sort by
            </label>
            <select
              id="review-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as ReviewSort)}
              className="h-10 rounded border border-line bg-paper px-2"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div aria-busy={loading}>
            {page.data.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        </>
      ) : null}
      {!loading && page && page.data.length === 0 && !error ? (
        <p className="text-stone">No reviews yet. Bought this? Tell others how it fits.</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
      {hasMore ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => page && void load(page.meta.page + 1, true)}
          className="mt-6 h-11 rounded border border-line px-5 text-sm font-semibold hover:border-ink disabled:opacity-60"
        >
          Show more reviews
        </button>
      ) : null}
    </section>
  );
}
