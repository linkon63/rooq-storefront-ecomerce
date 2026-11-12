"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { deleteReview as apiDeleteReview, getAllReviews, updateReview as apiUpdateReview } from "@/lib/admin-api/content";
import type { Review, ReviewStatus } from "@/types/admin/content";

const LIMIT = 20;
export type ReviewFilter = "ALL" | ReviewStatus;

const messageOf = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

/** Admin review moderation: paginated list (infinite scroll), status filter, search, approve/reject/delete. */
export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ReviewFilter>("ALL");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const reqRef = useRef(0);

  const load = useCallback(async (p: number, q: string, status: ReviewFilter) => {
    const myReq = ++reqRef.current;
    setIsLoading(true);
    setError("");
    try {
      const params: Record<string, string> = { page: String(p), limit: String(LIMIT) };
      if (q.trim()) params.search = q.trim();
      if (status !== "ALL") params.status = status;
      const response = await getAllReviews(params);
      if (myReq !== reqRef.current) return;
      setReviews((prev) =>
        p === 1 ? response.data : [...prev, ...response.data.filter((d) => !prev.some((r) => r.id === d.id))],
      );
      setTotal(response.meta.total);
    } catch (err) {
      if (myReq !== reqRef.current) return;
      setError(messageOf(err, ERROR_MESSAGES.review.loadFailed));
      setReviews([]);
    } finally {
      if (myReq === reqRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void load(page, search, filter), search ? 300 : 0);
    return () => window.clearTimeout(id);
  }, [page, search, filter, load]);

  const changeSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const changeFilter = useCallback((value: ReviewFilter) => {
    setFilter(value);
    setPage(1);
  }, []);

  async function moderate(review: Review, status: ReviewStatus) {
    setBusyId(review.id);
    try {
      const updated = await apiUpdateReview(review.id, { status });
      setReviews((prev) =>
        filter === "ALL" || filter === status
          ? prev.map((row) => (row.id === review.id ? { ...row, ...updated } : row))
          : prev.filter((row) => row.id !== review.id),
      );
      if (filter !== "ALL" && filter !== status) setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      toast.error(messageOf(err, ERROR_MESSAGES.review.updateFailed));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(review: Review): Promise<boolean> {
    setBusyId(review.id);
    try {
      await apiDeleteReview(review.id);
      setReviews((prev) => prev.filter((row) => row.id !== review.id));
      setTotal((t) => Math.max(0, t - 1));
      return true;
    } catch (err) {
      toast.error(messageOf(err, ERROR_MESSAGES.review.deleteFailed));
      return false;
    } finally {
      setBusyId(null);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return {
    reviews,
    isLoading,
    error,
    search,
    setSearch: changeSearch,
    filter,
    setFilter: changeFilter,
    page,
    setPage,
    total,
    hasMore: page < totalPages,
    busyId,
    moderate,
    remove,
  };
}
