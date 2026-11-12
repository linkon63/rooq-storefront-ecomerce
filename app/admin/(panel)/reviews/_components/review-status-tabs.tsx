"use client";

import { REVIEW_STATUS_LABELS } from "@/lib/constants/content";
import type { ReviewFilter } from "../../../_hooks/use-reviews";

const TABS: { value: ReviewFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: REVIEW_STATUS_LABELS.PENDING },
  { value: "APPROVED", label: REVIEW_STATUS_LABELS.APPROVED },
  { value: "REJECTED", label: REVIEW_STATUS_LABELS.REJECTED },
];

export function ReviewStatusTabs({ value, onChange }: { value: ReviewFilter; onChange: (value: ReviewFilter) => void }) {
  return (
    <div aria-label="Filter reviews by status" className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="tablist">
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            aria-selected={active}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
              active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
            key={tab.value}
            onClick={() => onChange(tab.value)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
