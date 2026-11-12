"use client";

import { AdminIcon } from "../../../_components/admin-icons";
import { INPUT_CLASS } from "../../../_components/form-field";
import type { AttributeValueForm } from "../_hooks/use-attributes";

type Props = { values: AttributeValueForm[]; disabled: boolean; onChange: (values: AttributeValueForm[]) => void };

export function AttributeValuesEditor({ values, disabled, onChange }: Props) {
  const update = (index: number, value: string) => onChange(values.map((item, i) => (i === index ? { ...item, value } : item)));
  const remove = (index: number) => onChange(values.length === 1 ? [{ value: "" }] : values.filter((_, i) => i !== index));

  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center justify-between gap-3 rounded-t-lg border-b border-slate-200 bg-white px-3 py-2">
        <span className="block text-sm font-medium text-slate-700">Values</span>
        <button
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium transition-colors hover:bg-slate-100"
          disabled={disabled}
          onClick={() => onChange([...values, { value: "" }])}
          type="button"
        >
          <AdminIcon className="h-3.5 w-3.5" name="plus" />
          Add Value
        </button>
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto p-3">
        {values.map((item, index) => (
          <div className="flex gap-2" key={item.id ?? index}>
            <input
              aria-label={`Value ${index + 1}`}
              className={`${INPUT_CLASS} min-w-0 flex-1`}
              onChange={(event) => update(index, event.target.value)}
              placeholder={index === 0 ? "Linen" : "Value"}
              value={item.value}
            />
            <button
              aria-label={`Remove value ${index + 1}`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-red-100 bg-red-50/50 text-red-500 transition-colors hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
              disabled={disabled || values.length === 1}
              onClick={() => remove(index)}
              type="button"
            >
              <AdminIcon className="h-4 w-4" name="trash" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
