"use client";

import { useState } from "react";
import { PageHeader } from "../../_components/admin-shell";
import { ConfirmModal } from "../../_components/confirm-modal";
import { InfiniteScroll } from "../../_components/infinite-scroll";
import { ReviewsTableSkeleton } from "../../_components/reviews-table-skeleton";
import { useReviews } from "../../_hooks/use-reviews";
import type { Review } from "@/types/admin/content";
import { ReviewSearch } from "./_components/review-search";
import { ReviewStatusTabs } from "./_components/review-status-tabs";
import { ReviewsTable } from "./_components/reviews-table";

export default function ReviewsPage() {
  const { reviews, isLoading, error, search, setSearch, filter, setFilter, setPage, total, hasMore, busyId, moderate, remove } =
    useReviews();
  const [toDelete, setToDelete] = useState<Review | null>(null);

  async function confirmDelete() {
    if (!toDelete) return;
    if (await remove(toDelete)) setToDelete(null);
  }

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Approve, reject or remove product reviews, with fit feedback and shopper photos."
        action={<ReviewSearch onChange={setSearch} value={search} />}
      />

      {error && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800" role="alert">
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
          <ReviewStatusTabs onChange={setFilter} value={filter} />
          <p aria-live="polite" className="text-sm font-medium text-slate-500">
            {total} {total === 1 ? "review" : "reviews"}
          </p>
        </div>

        {isLoading && reviews.length === 0 ? (
          <ReviewsTableSkeleton />
        ) : reviews.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm font-semibold text-slate-400">
            {search || filter !== "ALL" ? "No reviews match these filters." : "No reviews yet."}
          </p>
        ) : (
          <>
            <ReviewsTable busyId={busyId} onDelete={setToDelete} onModerate={moderate} reviews={reviews} />
            <InfiniteScroll
              allLoadedLabel="All reviews loaded"
              hasMore={hasMore}
              isLoading={isLoading}
              itemLabel="reviews"
              loaded={reviews.length}
              loadingLabel="Loading more…"
              onLoadMore={() => setPage((p) => p + 1)}
              total={total}
            />
          </>
        )}
      </section>

      <ConfirmModal
        cancelText="Keep"
        confirmText="Delete review"
        isDestructive
        isOpen={toDelete !== null}
        message={`Delete ${toDelete?.user?.name ?? "this customer"}'s review of ${toDelete?.product?.name ?? "this product"}? This cannot be undone.`}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete review"
      />
    </>
  );
}
