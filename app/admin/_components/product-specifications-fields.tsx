"use client";

import {
  SPECIFICATION_SECTIONS,
  type SpecificationDrafts,
  type SpecificationKey,
} from "@/lib/product-specifications";

export default function ProductSpecificationsFields({
  value,
  onChange,
}: {
  value: SpecificationDrafts;
  onChange: (key: SpecificationKey, text: string) => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Product Specification</h2>
        <p className="text-xs text-slate-500">
          One bullet point per line. Leave a section empty to hide it on the product page.
        </p>
      </div>
      <div className="grid gap-4">
        {SPECIFICATION_SECTIONS.map(({ key, label }) => (
          <label key={key} className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-700">{label}</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              onChange={(event) => onChange(key, event.target.value)}
              placeholder={`One ${label.toLowerCase()} point per line`}
              value={value[key]}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
