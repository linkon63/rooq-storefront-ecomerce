"use client";

import type { PaymentStatus as OrderPaymentStatus } from "@/types/commerce/order";
import { AdminIcon } from "../../../_components/admin-shell";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  paymentStatus: OrderPaymentStatus | "";
  onPaymentStatus: (value: OrderPaymentStatus | "") => void;
  showPaymentStatus: boolean;
};

const PAYMENT_FILTERS: { value: OrderPaymentStatus | ""; label: string }[] = [
  { value: "", label: "All payments" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "partially_refunded", label: "Partially refunded" },
  { value: "refunded", label: "Refunded" },
];

export function OrderListFilters({ search, onSearch, paymentStatus, onPaymentStatus, showPaymentStatus }: Props) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/50 p-3">
      <label className="flex h-11 items-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-3 transition-colors focus-within:border-blue-500">
        <AdminIcon className="h-4 w-4 text-slate-400" name="search" />
        <span className="sr-only">Search orders</span>
        <input
          className="w-full bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400"
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Order no. / name / phone…"
          type="search"
          value={search}
        />
      </label>
      {showPaymentStatus ? (
        <label className="mt-1 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500">Payment</span>
          <select
            className="h-10 cursor-pointer rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-blue-500"
            onChange={(event) => onPaymentStatus(event.target.value as OrderPaymentStatus | "")}
            value={paymentStatus}
          >
            {PAYMENT_FILTERS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}
