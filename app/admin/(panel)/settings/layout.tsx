"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminIcon, type AdminIconName } from "../../_components/admin-shell";

const NAV_ITEMS: { label: string; href: string; icon: AdminIconName }[] = [
  { label: "General Settings", href: "/admin/settings/general",  icon: "settings"  },
  { label: "Hero Banner",      href: "/admin/settings/hero-banner", icon: "package" },
  { label: "Campaign",         href: "/admin/settings/campaigns", icon: "discount"  },
  { label: "Social & Contact", href: "/admin/settings/contact",   icon: "store"     },
  { label: "Manage Policy",    href: "/admin/settings/policy",    icon: "reviews"   },
  { label: "Branch",           href: "/admin/settings/branch",    icon: "stock"     },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 lg:h-screen lg:flex-row lg:overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full shrink-0 self-start rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-0 lg:h-full lg:w-[260px]">
        <p className="px-3 pb-2 pt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          WEBSITE
        </p>
        <nav aria-label="Settings" className="flex gap-1 overflow-x-auto lg:block lg:space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-3 text-left transition lg:w-full ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
                href={item.href}
                key={item.href}
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${
                    isActive ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <AdminIcon className="h-4 w-4" name={item.icon} />
                </span>
                <span className="text-sm font-black">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content slot */}
      <div className="min-w-0 flex-1 lg:overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
