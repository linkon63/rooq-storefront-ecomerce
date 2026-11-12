"use client";

import type { PolicyEntry } from "@/types/admin/settings";
import { FieldLabel, Input } from "../../_components/settings-ui";
import { MAX_TITLE_LENGTH } from "./policy-tabs";

/** Title + body of one policy. Leaving the body empty removes the policy from the storefront. */
export function PolicyEditor({
  label,
  policy,
  onChange,
}: {
  label: string;
  policy: PolicyEntry;
  onChange: (field: keyof PolicyEntry, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <FieldLabel>{label} title</FieldLabel>
          <Input
            onChange={(value) => {
              if (value.length <= MAX_TITLE_LENGTH) onChange("title", value);
            }}
            placeholder={label}
            value={policy.title}
          />
        </div>
        <span className="mb-1 shrink-0 text-xs font-medium tabular-nums text-slate-400">
          {policy.title.length}/{MAX_TITLE_LENGTH}
        </span>
      </div>
      <div>
        <label className="mb-2 block text-sm font-black text-slate-700" htmlFor="policy-content">
          Policy text
        </label>
        <textarea
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          id="policy-content"
          onChange={(event) => onChange("content", event.target.value)}
          placeholder="Write the policy as shoppers will read it. Leave empty to hide it."
          rows={18}
          value={policy.content}
        />
      </div>
    </div>
  );
}
