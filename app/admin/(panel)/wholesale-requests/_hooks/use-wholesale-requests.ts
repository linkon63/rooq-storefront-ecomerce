"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { convertWholesaleRequest, getWholesaleRequest, listWholesaleRequests, updateWholesaleStatus } from "@/lib/admin-api/commerce";
import type { OrderResponse as Order } from "@/types/commerce/order";
import type { ConvertWholesaleInput, WholesaleRequestResponse as WholesaleOrderRequest, WholesaleRequestStatus } from "@/types/commerce/wholesale";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";

export type WholesaleFilter = WholesaleRequestStatus | "all";
const message = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

export function useWholesaleRequests() {
  const [requests, setRequests] = useState<WholesaleOrderRequest[]>([]);
  const [filter, setFilter] = useState<WholesaleFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<WholesaleOrderRequest | null>(null);
  const [isActing, setIsActing] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setRequests(await listWholesaleRequests(filter === "all" ? undefined : filter));
    } catch (err) {
      setError(message(err, ERROR_MESSAGES.wholesale.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Opens from the list row, then swaps in the detail (customer addresses). */
  async function open(request: WholesaleOrderRequest) {
    setSelected(request);
    try {
      setSelected(await getWholesaleRequest(request.id));
    } catch {
      /* keep the list-row data if the detail fetch fails */
    }
  }

  async function setStatus(status: "approved" | "rejected" | "info_requested", note?: string): Promise<boolean> {
    if (!selected) return false;
    setIsActing(true);
    try {
      await updateWholesaleStatus(selected.id, { status, ...(note?.trim() ? { note: note.trim() } : {}) });
      toast.success(SUCCESS_MESSAGES.commerce.wholesaleUpdated);
      setSelected(null);
      await load();
      return true;
    } catch (err) {
      toast.error(message(err, ERROR_MESSAGES.wholesale.updateFailed));
      return false;
    } finally {
      setIsActing(false);
    }
  }

  /** Returns the created order, or an error string for the form. */
  async function convert(body: ConvertWholesaleInput): Promise<Order | string> {
    if (!selected) return ERROR_MESSAGES.wholesale.convertFailed;
    setIsActing(true);
    try {
      const order = await convertWholesaleRequest(selected.id, body);
      await load();
      return order;
    } catch (err) {
      return message(err, ERROR_MESSAGES.wholesale.convertFailed);
    } finally {
      setIsActing(false);
    }
  }

  return { requests, filter, setFilter, isLoading, error, reload: load, selected, open, close: () => setSelected(null), isActing, setStatus, convert };
}
