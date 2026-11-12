"use client";

import { useEffect, type ReactNode } from "react";
import { AdminIcon } from "../../_components/admin-icons";
import { IconButton } from "./button";

/** Minimal accessible dialog: Escape and backdrop close it. */
export function Modal({ title, onClose, children, footer, wide }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 px-4 py-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`max-h-full w-full overflow-y-auto rounded-xl bg-white shadow-xl ${wide ? "max-w-3xl" : "max-w-lg"}`}>
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <AdminIcon className="h-4 w-4" name="x" />
          </IconButton>
        </header>
        <div className="grid gap-4 px-5 py-4">{children}</div>
        {footer ? <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">{footer}</footer> : null}
      </div>
    </div>
  );
}
