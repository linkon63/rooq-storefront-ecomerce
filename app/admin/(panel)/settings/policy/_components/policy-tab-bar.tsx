"use client";

import { POLICY_TABS, type PolicyKey } from "./policy-tabs";

export function PolicyTabBar({ active, onSelect }: { active: PolicyKey; onSelect: (key: PolicyKey) => void }) {
  return (
    <div className="mb-6 flex overflow-x-auto border-b border-slate-200" role="tablist">
      {POLICY_TABS.map((tab) => (
        <button
          aria-selected={tab.key === active}
          className={`shrink-0 border-b-2 px-4 pb-3 pt-1 text-sm font-black transition ${
            tab.key === active ? "border-slate-900 text-slate-900" : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
          key={tab.key}
          onClick={() => onSelect(tab.key)}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
