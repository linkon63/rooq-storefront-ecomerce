"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { listAdminReturns, updateReturnStatus } from "@/lib/admin-api/commerce";
import type { ReturnRequestResponse, ReturnStatus, ReturnStatusInput } from "@/types/commerce/returns";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;
const message = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

/** Admin returns list (status tab + search + paging) and the status actions. */
export function useReturns(initialStatus: ReturnStatus | "" = "REQUESTED") {
  const [rows, setRows] = useState<ReturnRequestResponse[]>([]);
  const [status, setStatus] = useState<ReturnStatus | "">(initialStatus);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (status) params.set("status", status);
      if (search.trim()) params.set("search", search.trim());
      const res = await listAdminReturns(params);
      if (requestId !== requestRef.current) return;
      setRows(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      if (requestId === requestRef.current) setError(message(err, ERROR_MESSAGES.returns.loadFailed));
    } finally {
      if (requestId === requestRef.current) setIsLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    const timer = setTimeout(load, search ? SEARCH_DEBOUNCE_MS : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  async function update(id: string, body: ReturnStatusInput): Promise<boolean> {
    setIsUpdating(true);
    try {
      const updated = await updateReturnStatus(id, body);
      setRows((prev) => prev.map((row) => (row.id === id ? updated : row)));
      toast.success(SUCCESS_MESSAGES.commerce.returnUpdated(updated.status));
      return true;
    } catch (err) {
      toast.error(message(err, ERROR_MESSAGES.returns.updateFailed));
      return false;
    } finally {
      setIsUpdating(false);
    }
  }

  return {
    rows,
    total,
    page,
    totalPages,
    status,
    search,
    isLoading,
    isUpdating,
    error,
    selected: rows.find((row) => row.id === selectedId) ?? null,
    select: setSelectedId,
    setPage,
    selectStatus: (next: ReturnStatus | "") => {
      setStatus(next);
      setPage(1);
    },
    changeSearch: (next: string) => {
      setSearch(next);
      setPage(1);
    },
    update,
  };
}
