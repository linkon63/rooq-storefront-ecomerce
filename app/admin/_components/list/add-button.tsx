"use client";

import { AdminIcon } from "../admin-icons";

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-5 text-[14px] font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
      onClick={onClick}
      type="button"
    >
      <AdminIcon className="h-5 w-5" name="plus" />
      {label}
    </button>
  );
}
