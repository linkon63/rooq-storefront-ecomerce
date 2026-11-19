"use client";

import type { GallerySourceFilter, GalleryStatusFilter } from "../../../_hooks/use-gallery";

const STATUS_TABS: { value: GalleryStatusFilter; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ALL", label: "All" },
];

const SOURCE_TABS: { value: GallerySourceFilter; label: string }[] = [
  { value: "ALL", label: "All sources" },
  { value: "WEBSITE", label: "Website" },
  { value: "FACEBOOK", label: "Facebook" },
];

type TabsProps<T extends string> = { label: string; tabs: { value: T; label: string }[]; value: T; onChange: (value: T) => void };

function Tabs<T extends string>({ label, tabs, value, onChange }: TabsProps<T>) {
  return (
    <div aria-label={label} className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="tablist">
      {tabs.map((tab) => (
        <button
          aria-selected={tab.value === value}
          className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
            tab.value === value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
          key={tab.value}
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

type Props = {
  status: GalleryStatusFilter;
  source: GallerySourceFilter;
  onStatus: (value: GalleryStatusFilter) => void;
  onSource: (value: GallerySourceFilter) => void;
};

export function GalleryFilters({ status, source, onStatus, onSource }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <Tabs label="Filter by status" onChange={onStatus} tabs={STATUS_TABS} value={status} />
      <Tabs label="Filter by source" onChange={onSource} tabs={SOURCE_TABS} value={source} />
    </div>
  );
}
