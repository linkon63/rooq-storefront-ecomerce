"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { listAdminOrders, updateAdminOrderStatus } from "@/lib/admin-api/commerce";
import type { OrderResponse as Order, PaymentStatus as OrderPaymentStatus, OrderStatus } from "@/types/commerce/order";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

const errorText = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

function successFor(status: OrderStatus): string {
  if (status === "cancelled") return SUCCESS_MESSAGES.commerce.orderCancelled;
  if (status === "returned") return SUCCESS_MESSAGES.commerce.orderReturned;
  return SUCCESS_MESSAGES.commerce.orderAccepted;
}

type Options = { fixedStatus?: OrderStatus; defaultStatus?: OrderStatus | "" };

/** Admin order list: URL-seeded filters, infinite paging, status/payment updates. */
export function useOrders({ fixedStatus, defaultStatus = "" }: Options = {}) {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus | "">(fixedStatus ?? ((searchParams?.get("status") as OrderStatus) || defaultStatus));
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus | "">((searchParams?.get("paymentStatus") as OrderPaymentStatus) || "");
  const [search, setSearch] = useState(searchParams?.get("search") ?? "");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const requestRef = useRef(0);

  const loadOrders = useCallback(async () => {
    const requestId = ++requestRef.current;
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (status) params.set("status", status);
      if (paymentStatus) params.set("paymentStatus", paymentStatus);
      if (search.trim()) params.set("search", search.trim());
      const res = await listAdminOrders(params);
      if (requestId !== requestRef.current) return;
      setOrders((prev) => (page === 1 ? res.data : [...prev, ...res.data.filter((o) => !prev.some((p) => p.id === o.id))]));
      setTotal(res.meta.total);
      if (page === 1) setSelectedId((prev) => (prev && res.data.some((o) => o.id === prev) ? prev : (res.data[0]?.id ?? null)));
    } catch (err) {
      if (requestId !== requestRef.current) return;
      setError(errorText(err, ERROR_MESSAGES.order.loadFailed));
      setOrders([]);
    } finally {
      if (requestId === requestRef.current) setIsLoading(false);
    }
  }, [page, status, paymentStatus, search]);

  useEffect(() => {
    const timer = setTimeout(loadOrders, search ? SEARCH_DEBOUNCE_MS : 0);
    return () => clearTimeout(timer);
  }, [loadOrders, search]);

  /** Puts a fresh copy of one order (after a shipment or payment change) into the list. */
  const replaceOrder = useCallback((order: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
  }, []);

  async function update(body: { status?: OrderStatus; note?: string; paymentStatus?: OrderPaymentStatus }, success: string) {
    if (!selectedId || isUpdating) return;
    setIsUpdating(true);
    try {
      replaceOrder(await updateAdminOrderStatus(selectedId, body));
      toast.success(success);
      await loadOrders();
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.order.updateFailed));
    } finally {
      setIsUpdating(false);
    }
  }

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) ?? null, [orders, selectedId]);

  return {
    orders,
    selected,
    selectedId,
    setSelectedId,
    status,
    paymentStatus,
    search,
    total,
    page,
    isLoading,
    isUpdating,
    error,
    hasMore: page < Math.max(1, Math.ceil(total / PAGE_SIZE)),
    loadMore: () => setPage((p) => p + 1),
    selectStatus: (next: OrderStatus) => {
      setStatus(next);
      setPaymentStatus("");
      setPage(1);
    },
    selectPaymentStatus: (next: OrderPaymentStatus | "") => {
      setPaymentStatus(next);
      setPage(1);
    },
    changeSearch: (next: string) => {
      setSearch(next);
      setPage(1);
    },
    replaceOrder,
    updateOrderStatus: (next: OrderStatus, note?: string) => update({ status: next, note: note?.trim() || undefined }, successFor(next)),
    updatePaymentStatus: (next: OrderPaymentStatus) => {
      if (selected && selected.status !== "delivered") {
        toast.error(ERROR_MESSAGES.order.paymentOnlyWhenDelivered);
        return Promise.resolve();
      }
      return update({ paymentStatus: next }, SUCCESS_MESSAGES.commerce.paymentUpdated);
    },
  };
}

export type OrdersController = ReturnType<typeof useOrders>;
