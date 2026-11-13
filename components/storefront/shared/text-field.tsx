import type { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string | null;
  hint?: string;
};

/** Labelled input with inline error wiring (aria-invalid / aria-describedby); required fields get a red asterisk. */
export function TextField({ label, id, error, hint, className = "", ...input }: TextFieldProps) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {input.required ? (
          <span aria-hidden className="text-red-600">
            {" "}*
          </span>
        ) : (
          <span className="font-normal text-stone"> (optional)</span>
        )}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="h-12 rounded border border-line bg-paper px-3 text-base aria-[invalid=true]:border-dye-deep"
        {...input}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-stone">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}
