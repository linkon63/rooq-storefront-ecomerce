"use client";

import type { ReturnStatus } from "@/types/commerce/returns";

const TABS: { value: ReturnStatus | ""; label: string }[] = [
  { value: "REQUESTED", label: "To review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "EXCHANGED", label: "Exchanged" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "", label: "All" },
];

export function ReturnStatusTabs({ value, onChange }: { value: ReturnStatus | ""; onChange: (value: ReturnStatus | "") => void }) {
  return (
    <div className="flex flex-wrap gap-2 px-5 pb-4" role="tablist">
      {TABS.map((tab) => (
        <button
          aria-selected={value === tab.value}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${value === tab.value ? "bg-blue-600 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"}`}
          key={tab.label}
          onClick={() => onChange(tab.value)}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
