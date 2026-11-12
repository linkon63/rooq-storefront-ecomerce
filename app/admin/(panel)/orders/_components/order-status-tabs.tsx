"use client";

import type { OrderStatus } from "@/types/commerce/order";

/**
 * No "All" tab on purpose: each tab is one stage, so an order accepted in one
 * tab moves out of it instead of sitting next to untouched ones.
 */
export const ORDER_TABS: readonly { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "returned", label: "Returned" },
];

export function OrderStatusTabs({ value, onChange }: { value: OrderStatus | ""; onChange: (status: OrderStatus) => void }) {
  return (
    <div className="mb-6 flex gap-6 overflow-x-auto border-b border-slate-200" role="tablist">
      {ORDER_TABS.map((tab) => (
        <button
          aria-selected={value === tab.key}
          className={`-mb-[2px] cursor-pointer whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors ${
            value === tab.key ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
          }`}
          key={tab.key}
          onClick={() => onChange(tab.key)}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
