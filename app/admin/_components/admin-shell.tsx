"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useLoadCurrency } from "@/hooks/use-currency";
import type { AppSettings } from "@/types/admin/settings";
import { useAdminSession } from "../_hooks/use-admin-session";
import { useSettingsLoading } from "../_hooks/use-settings";
import { AdminIcon } from "./admin-icons";
import { AdminBrand } from "./shell/admin-brand";
import { AdminSidebarNav } from "./shell/admin-sidebar-nav";
import { AdminUserCard } from "./shell/admin-user-card";

export { PageHeader, StatusToggle, ProductThumb } from "./admin-ui";
export { AdminIcon } from "./admin-icons";
export type { AdminIconName } from "./admin-icons";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isChecking, logout } = useAdminSession();
  const { loadSettings } = useSettingsLoading();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  useLoadCurrency();

  useEffect(() => {
    void loadSettings().then(setSettings);
  }, [loadSettings]);

  if (isChecking) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#fbfbfc] text-slate-700">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 font-black shadow-sm" role="status">
          Checking admin session…
        </div>
      </div>
    );
  }

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="admin-dashboard min-h-screen bg-[#fbfbfc] text-[#111827]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <AdminBrand logo={settings?.logo} shopName={settings?.shopName} />
        <button
          aria-controls="admin-sidebar"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-700"
          onClick={() => setMobileOpen((open) => !open)}
          type="button"
        >
          <AdminIcon className="h-5 w-5" name={mobileOpen ? "x" : "menu"} />
        </button>
      </header>
      {mobileOpen ? (
        <button aria-label="Close menu" className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={closeMobile} type="button" />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[312px] border-r border-slate-200 bg-white lg:block ${mobileOpen ? "block" : "hidden"}`}
        id="admin-sidebar"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5">
            <AdminBrand logo={settings?.logo} shopName={settings?.shopName} />
          </div>
          <AdminSidebarNav onNavigate={closeMobile} pathname={pathname} roleName={user?.role?.name} />
          <AdminUserCard onLogout={logout} user={user} />
        </div>
      </aside>
      <div className="lg:pl-[312px]">
        <main className="mx-auto w-full max-w-[1720px] px-2 sm:px-4">{children}</main>
      </div>
    </div>
  );
}
