"use client";

import { useEffect } from "react";
import { LuX } from "react-icons/lu";
import type { ShopPolicy } from "@/lib/shop-api";

/**
 * Reads a policy the admin wrote in Settings → Policy. The text is stored as
 * plain paragraphs, so it is rendered with the line breaks preserved rather
 * than as HTML — nothing typed in the admin panel can inject markup here.
 */
export default function PolicyModal({
  policy,
  onClose,
}: {
  policy: ShopPolicy | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!policy) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [policy, onClose]);

  if (!policy) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        aria-labelledby="policy-modal-title"
        aria-modal="true"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-6 py-5">
          <h2
            className="font-display text-xl font-bold text-[#1f2a17] sm:text-2xl"
            id="policy-modal-title"
          >
            {policy.title}
          </h2>
          <button
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
            onClick={onClose}
            type="button"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <p className="whitespace-pre-line font-gotham text-sm leading-relaxed text-stone-700">
            {policy.content}
          </p>
        </div>

        <div className="border-t border-stone-200 px-6 py-4 text-right">
          <button
            className="cursor-pointer rounded-full bg-brand px-8 py-3 font-gotham text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-dark"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
