"use client";

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
  autoFocus?: boolean;
};

const fieldClass =
  "w-full rounded-lg border border-slate-300 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

/** Labelled input, or a textarea when `rows` is given. */
export function NewsTextField({ label, hint, value, onChange, required, rows, autoFocus }: Props) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {hint && <span className="ml-1 font-medium text-slate-400">({hint})</span>}
      </span>
      {rows ? (
        <textarea
          className={`${fieldClass} py-3`}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          rows={rows}
          value={value}
        />
      ) : (
        <input
          autoFocus={autoFocus}
          className={`${fieldClass} h-11`}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          value={value}
        />
      )}
    </label>
  );
}
