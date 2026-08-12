"use client";

import { useCallback, useEffect, useState } from "react";
import { FiLoader, FiCheckCircle, FiTruck, FiClock, FiSearch, FiPackage } from "react-icons/fi";
import { toast } from "sonner";
import { getCustomerToken } from "@/lib/storefront-api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

const SECTION_LABEL = "text-[10px] font-bold tracking-[0.18em] uppercase text-[#4a9e2f]";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  placedAt: string;
  createdAt: string;
}

const STEPS = [
  { label: "Order Placed",  statuses: ["pending", "processing", "shipped", "delivered"], Icon: FiClock        },
  { label: "Processing",    statuses: ["processing", "shipped", "delivered"],             Icon: FiPackage      },
  { label: "Shipped",       statuses: ["shipped", "delivered"],                           Icon: FiTruck        },
  { label: "Delivered",     statuses: ["delivered"],                                      Icon: FiCheckCircle  },
] as const;

function statusBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":  return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "shipped":    return "bg-sky-50 text-sky-700 border-sky-200";
    case "processing": return "bg-amber-50 text-amber-700 border-amber-200";
    case "cancelled":  return "bg-red-50 text-red-700 border-red-200";
    case "returned":   return "bg-purple-50 text-purple-700 border-purple-200";
    default:           return "bg-stone-50 text-stone-600 border-stone-200";
  }
}

export default function TrackOrderView() {
  const [invoiceId, setInvoiceId] = useState("");
  const [order, setOrder]         = useState<Order | null>(null);
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);

  /**
   * Tracking searches the customer's own orders. Shoppers type the order
   * number they see on the invoice ("ORD-1234…"), which is not the id the
   * `/orders/:id` route expects — and that route needs the bearer token
   * anyway, which is why the old lookup always came back empty.
   */
  const loadOrders = useCallback(async () => {
    const token = getCustomerToken();
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : (data?.data ?? []));
    } catch { /* silent — the search just finds nothing */ }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const findOrder = (query: string, list: Order[]) => {
    const needle = query.trim().toLowerCase();
    return (
      list.find((entry) => entry.orderNumber?.toLowerCase() === needle) ??
      list.find((entry) => entry.id?.toLowerCase() === needle) ??
      list.find((entry) => entry.orderNumber?.toLowerCase().includes(needle)) ??
      null
    );
  };

  const track = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    setOrder(null);

    // Always re-read the list so a just-placed order is trackable right away.
    const token = getCustomerToken();
    let list = orders;
    if (token) {
      try {
        const res = await fetch(`${BASE_URL}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          list = Array.isArray(data) ? data : (data?.data ?? []);
          setOrders(list);
        }
      } catch {
        toast.error("Failed to reach the server. Please try again.");
      }
    }

    const match = findOrder(query, list);
    if (!match) toast.error("Order not found. Please check your Order Number.");
    setOrder(match);
    setLoading(false);
    setSearched(true);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    void track(invoiceId);
  };

  const isCancelled = order?.status?.toLowerCase() === "cancelled";

  return (
    <div className="space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <p className={SECTION_LABEL}>Shipment</p>
        <h2 className="font-['Bembo_Std'] text-2xl text-zinc-850 font-normal mt-1">
          Track Your Order
        </h2>
        <p className="font-['Bembo_Std'] text-zinc-400 text-sm italic mt-0.5">
          Enter your order number to see the current shipment status.
        </p>
      </div>

      {/* ── Search Form ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleTrack} className="flex gap-3 max-w-xl">
        <div className="grow relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 text-sm pointer-events-none" />
          <input
            type="text"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            placeholder="Enter Order Number (e.g. ORD-1712345678)"
            className="w-full pl-10 pr-4 py-3 border border-stone-200 bg-white text-sm font-sans text-zinc-800 outline-none focus:border-[#4a9e2f] focus:ring-1 focus:ring-[#4a9e2f] transition rounded-xl placeholder:text-zinc-300"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-2 bg-[#4a9e2f] hover:bg-[#3d8626] text-white font-sans text-[10px] font-bold tracking-[0.16em] uppercase px-7 py-3 rounded-xl transition cursor-pointer shadow-md disabled:opacity-60"
        >
          {loading ? <FiLoader className="animate-spin w-3.5 h-3.5" /> : "Track"}
        </button>
      </form>

      {/* ── Recent orders — one click instead of typing the number ─────────── */}
      {orders.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-zinc-400">
            Recent:
          </span>
          {orders.slice(0, 5).map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                setInvoiceId(entry.orderNumber);
                void track(entry.orderNumber);
              }}
              className="border border-stone-200 bg-white hover:border-[#4a9e2f] hover:text-[#4a9e2f] text-zinc-600 font-sans text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full transition cursor-pointer"
            >
              {entry.orderNumber}
            </button>
          ))}
        </div>
      )}

      {/* ── Result ──────────────────────────────────────────────────────────── */}
      {searched && (
        <div className="border-t border-stone-100 pt-10">
          {order ? (
            <div className="space-y-8">

              {/* Summary card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50 border border-stone-200 rounded-xl px-6 py-5">
                <div>
                  <p className="font-sans font-bold text-xs uppercase tracking-wider text-zinc-800">
                    {order.orderNumber}
                  </p>
                  <p className="font-sans text-[10px] text-zinc-400 mt-1">
                    Placed{" "}
                    {new Date(order.placedAt || order.createdAt).toLocaleDateString("en-US", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`border font-sans text-[9px] font-bold tracking-wider uppercase px-3 py-1 rounded-full ${statusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="font-sans font-bold text-sm text-zinc-800">
                    ৳{Number(order.total).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress tracker */}
              {!isCancelled ? (
                <div>
                  <p className="font-sans text-[10px] font-bold tracking-[0.18em] uppercase text-[#4a9e2f] mb-7">
                    Delivery Progress
                  </p>

                  {/* Desktop horizontal / mobile 2-col grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative">

                    {/* Connector lines — desktop only */}
                    <div className="absolute hidden sm:block top-[18px] left-[calc(12.5%+18px)] right-[calc(12.5%+18px)] h-px bg-stone-200 -z-0" />

                    {STEPS.map((step, idx) => {
                      const { Icon } = step;
                      const current = order.status.toLowerCase();
                      const isActive = (step.statuses as readonly string[]).includes(current);
                      const isCurrent =
                        isActive &&
                        !(STEPS[idx + 1]?.statuses as readonly string[] | undefined)?.includes(current);
                      return (
                        <div key={step.label} className="flex flex-col items-center gap-2 text-center relative z-10">
                          <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            isActive
                              ? isCurrent
                                ? "bg-[#4a9e2f] border-[#4a9e2f] text-white shadow-md shadow-[#4a9e2f]/30 scale-110"
                                : "bg-[#4a9e2f] border-[#4a9e2f] text-white"
                              : "bg-white border-stone-200 text-stone-300"
                          }`}>
                            <Icon className="text-sm" />
                          </div>
                          <p className={`font-sans text-[10px] font-bold tracking-wider uppercase transition-colors ${
                            isActive ? "text-zinc-800" : "text-stone-300"
                          }`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <span className="font-sans text-[9px] text-[#4a9e2f] font-bold tracking-wider uppercase">
                              Current
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-red-200 rounded-xl bg-red-50/40">
                  <p className="font-sans font-bold text-xs uppercase tracking-wider text-red-500 mb-1">
                    Order Cancelled
                  </p>
                  <p className="font-sans text-xs text-zinc-400">
                    This order has been cancelled and will not be shipped.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border border-dashed border-stone-200 rounded-xl">
              <FiSearch className="text-3xl text-zinc-200 mb-4" />
              <p className="font-['Bembo_Std'] text-zinc-500 text-base italic">Order not found.</p>
              <p className="font-sans text-xs text-zinc-300 mt-1 text-center max-w-xs">
                Please check the order number from your invoice, or pick one of your recent orders above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
