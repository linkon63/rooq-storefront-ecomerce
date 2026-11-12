"use client";

import Link from "next/link";
import type { DashboardRecentOrder } from "@/types/admin/dashboard";
import { formatMoney } from "@/utils/admin/format";
import { useCurrency } from "@/hooks/use-currency";
import { paymentTone } from "@/utils/dashboard/format";

const VISIBLE = 5;

export function RecentOrdersCard({ orders, isLoading }: { orders: DashboardRecentOrder[]; isLoading: boolean }) {
  const { symbol } = useCurrency();
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black">Recent orders</h2>
        <Link className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black hover:bg-slate-50" href="/admin/orders">
          View all
        </Link>
      </div>
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }, (_, index) => <div className="h-16 animate-pulse rounded-xl bg-slate-100" key={index} />)
        ) : orders.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 font-medium text-slate-400">No orders in this period.</p>
        ) : (
          orders.slice(0, VISIBLE).map((order) => (
            <Link
              className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 transition hover:bg-slate-100/80"
              href={`/admin/orders?search=${encodeURIComponent(order.orderNumber)}`}
              key={order.id}
            >
              <div className="min-w-0">
                <p className="truncate text-slate-800">{order.orderNumber}</p>
                <p className="truncate text-sm font-medium text-slate-500">{order.user?.name ?? "Guest"}</p>
              </div>
              <div className="text-right">
                <p className="font-black tabular-nums">{formatMoney(order.total, symbol)}</p>
                <span className={`text-xs font-black capitalize ${paymentTone(order.paymentStatus)}`}>
                  {order.paymentStatus.replace("_", " ")}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </article>
  );
}
