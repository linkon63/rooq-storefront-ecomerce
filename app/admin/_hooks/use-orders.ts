"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  apiRequest,
  type Order,
  type OrderPaymentStatus,
  type OrderStatus,
  type PaginatedOrders,
} from "../../../lib/admin-api";

const PAGE_SIZE = 20;

function num(value: unknown) {
  return Number(value ?? 0);
}

interface UseOrdersOptions {
  fixedStatus?: OrderStatus;
  /** Tab the list opens on when the page is not pinned to a single status. */
  defaultStatus?: OrderStatus | "";
}

export function useOrders({ fixedStatus, defaultStatus = "" }: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus | "">(fixedStatus ?? defaultStatus);
  const [paymentStatus, setPaymentStatus] = useState<OrderPaymentStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const searchParamStatus = searchParams?.get("status");
  const searchParamPaymentStatus = searchParams?.get("paymentStatus");
  const searchParamSearch = searchParams?.get("search");

  useEffect(() => {
    if (!fixedStatus) {
      setStatus((searchParamStatus as OrderStatus) || defaultStatus);
    }
    setPaymentStatus((searchParamPaymentStatus as OrderPaymentStatus) || "");
    setSearch(searchParamSearch || "");
    setPage(1);
  }, [fixedStatus, defaultStatus, searchParamStatus, searchParamPaymentStatus, searchParamSearch]);

  const reqRef = useRef(0);

  const loadOrders = useCallback(async () => {
    const myReq = ++reqRef.current;
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (status) params.set("status", status);
      if (paymentStatus) params.set("paymentStatus", paymentStatus);
      if (search.trim()) params.set("search", search.trim());

      const res = await apiRequest<PaginatedOrders>(`/orders?${params.toString()}`);
      if (myReq !== reqRef.current) return;
      setOrders((prev) => (page === 1 ? res.data : [...prev, ...res.data.filter((o) => !prev.some((p) => p.id === o.id))]));
      setTotal(res.meta.total);
      setSelectedId((prev) => {
        if (page === 1) {
          return prev && res.data.some((o) => o.id === prev) ? prev : (res.data[0]?.id ?? null);
        }
        return prev;
      });
    } catch (err) {
      if (myReq !== reqRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load orders");
      setOrders([]);
    } finally {
      if (myReq === reqRef.current) setIsLoading(false);
    }
  }, [page, status, paymentStatus, search]);

  async function updateOrderStatus(newStatus: OrderStatus) {
    if (!selectedId || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setError("");
    try {
      await apiRequest(`/orders/${selectedId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await loadOrders();
      const msg =
        newStatus === "cancelled"
          ? "Order cancelled."
          : newStatus === "returned"
            ? "Order returned."
            : "Order accepted.";
      toast.success(msg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function updatePaymentStatus(newPaymentStatus: OrderPaymentStatus) {
    if (!selectedId || isUpdatingStatus) return;
    const order = orders.find((o) => o.id === selectedId);
    if (order && order.status !== "delivered") {
      toast.error("Payment status can only be changed for delivered orders.");
      return;
    }
    setIsUpdatingStatus(true);
    setError("");
    try {
      await apiRequest(`/orders/${selectedId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      await loadOrders();
      toast.success("Payment status updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment status");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadOrders, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [loadOrders, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasMore = page < totalPages;

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) ?? null, [orders, selectedId]);

  const totals = useMemo(() => {
    if (!selected) return null;
    const items = selected.items ?? [];

    // `totalPrice` is what the line was charged; the list subtotal adds back
    // whatever the offer took off. Orders placed before offers were recorded
    // have no `discountAmount`, so the two subtotals collapse into one and the
    // panel renders exactly as it always did.
    const chargedSubtotal = items.reduce((sum, it) => sum + num(it.totalPrice), 0);
    const productDiscount = num(selected.productDiscount)
      || items.reduce((sum, it) => sum + num(it.discountAmount), 0);
    const subtotal = chargedSubtotal + productDiscount;

    const shipping = num(selected.shippingCost);
    const discount = num(selected.discount);
    const grand = num(selected.total);
    const recorded = (selected.payments ?? [])
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + num(p.amount), 0);

    // `paymentStatus` is what the rest of the system settles on — every report
    // and dashboard figure keys off it — and a COD order is settled by the
    // admin here rather than by a gateway, so it never gets a payment row.
    // Marking one paid therefore has to clear the due on its own; the recorded
    // total still wins when a gateway did write rows.
    const paid = selected.paymentStatus === "paid" ? Math.max(recorded, grand) : recorded;

    return {
      subtotal,
      chargedSubtotal,
      productDiscount,
      shipping,
      discount,
      grand,
      paid,
      // A refunded order has been settled and reversed — nothing is owed, so it
      // must not read back as a full outstanding balance.
      due: selected.paymentStatus === "refunded" ? 0 : Math.max(0, grand - paid),
    };
  }, [selected]);

  return {
    orders,
    selected,
    selectedId,
    setSelectedId,
    status,
    setStatus,
    paymentStatus,
    setPaymentStatus,
    search,
    setSearch,
    page,
    setPage,
    total,
    isLoading,
    error,
    isUpdatingStatus,
    totalPages,
    hasMore,
    totals,
    updateOrderStatus,
    updatePaymentStatus,
  };
}
