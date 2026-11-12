"use client";

import { useId, type FormEvent, type ReactNode } from "react";
import { AdminIcon, type AdminIconName } from "./admin-icons";

type Props = {
  title: string;
  description?: string;
  busy?: boolean;
  submitLabel: string;
  submitIcon?: AdminIconName;
  error?: string | null;
  size?: "md" | "lg" | "xl";
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
};

const WIDTH = { md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" } as const;

/** Admin create/edit dialog: header, scrollable body, error line, Cancel + submit footer. */
export function FormModal({ title, description, busy, submitLabel, submitIcon = "check", error, size = "md", onClose, onSubmit, children }: Props) {
  const titleId = useId();
  const close = () => {
    if (!busy) onClose();
  };
  return (
    <div aria-labelledby={titleId} aria-modal="true" className="modal-backdrop fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6" role="dialog">
      <form
        className={`modal-panel flex max-h-[calc(100vh-3rem)] w-full ${WIDTH[size]} flex-col rounded-xl border border-slate-200 bg-white shadow-2xl`}
        onKeyDown={(event) => {
          if (event.key === "Escape") close();
        }}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(event);
        }}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 pb-5 pt-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900" id={titleId}>{title}</h3>
            {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
          </div>
          <button aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600" disabled={busy} onClick={close} type="button">
            <AdminIcon className="h-4 w-4" name="x" />
          </button>
        </div>
        <div className="modal-body flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            {children}
            {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button className="h-10 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50" disabled={busy} onClick={close} type="button">
            Cancel
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-slate-400" disabled={busy} type="submit">
            <AdminIcon className="h-4 w-4" name={submitIcon} />
            {busy ? "Saving…" : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
