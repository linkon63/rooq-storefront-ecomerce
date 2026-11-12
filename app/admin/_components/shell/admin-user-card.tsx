"use client";

import type { AdminUser } from "@/types/admin/catalog";
import { AdminIcon } from "../admin-icons";

export function AdminUserCard({ user, onLogout }: { user: AdminUser | null; onLogout: () => void }) {
  return (
    <div className="border-t border-slate-100 p-4">
      <div className="flex items-center gap-3">
        <div aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-stone-900 font-black text-white">
          {user?.name?.charAt(0).toUpperCase() ?? "A"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black">{user?.name ?? "Admin"}</p>
          <p className="truncate text-xs font-medium text-slate-500">{user?.email ?? "Store admin"}</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
          onClick={onLogout}
          type="button"
        >
          <AdminIcon className="h-3.5 w-3.5" name="logout" />
          Exit
        </button>
      </div>
    </div>
  );
}
