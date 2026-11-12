import type { ReactNode } from "react";
import { IMAGE_SIZE_HINT } from "../../../lib/admin-image-upload";
import { AdminIcon } from "./admin-icons";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="pt-6 mb-8 flex flex-col justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function StatusToggle({
  checked,
  onChange,
  disabled,
}: {
  checked?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
}) {
  const isOn = checked ?? true;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      disabled={disabled}
      onClick={() => onChange?.(!isOn)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
        isOn ? "bg-emerald-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          isOn ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function ProductThumb({ src, alt }: { src?: string; alt?: string }) {
  return (
    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-slate-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt ?? ''}
        className="h-full w-full object-cover object-center"
        src={src ?? '/images/no-image-icon-6.png'}
      />
    </div>
  );
}

// Highlighted upload-limit badge shown next to every admin image picker.
export function ImageSizeHint({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 ring-1 ring-inset ring-amber-300 ${className}`}
    >
      <AdminIcon className="h-3 w-3" name="info" />
      {IMAGE_SIZE_HINT}
    </span>
  );
}
