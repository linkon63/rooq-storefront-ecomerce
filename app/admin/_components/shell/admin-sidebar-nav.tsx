"use client";

import { useState } from "react";
import { hasRequiredRole } from "@/utils/roles";
import { ADMIN_NAV, type AdminNavGroup } from "./admin-nav";
import { AdminNavItemView } from "./admin-nav-item";

function visibleGroups(roleName: string | null | undefined): AdminNavGroup[] {
  return ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.roles || hasRequiredRole(roleName, item.roles)),
  })).filter((group) => group.items.length > 0);
}

function initiallyOpen(): Record<string, boolean> {
  const open: Record<string, boolean> = {};
  for (const group of ADMIN_NAV) for (const item of group.items) if (item.children?.length) open[item.label] = true;
  return open;
}

type Props = { pathname: string; roleName?: string | null; onNavigate?: () => void };

export function AdminSidebarNav({ pathname, roleName, onNavigate }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>(initiallyOpen);
  const toggle = (label: string) => setOpen((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-6 pt-5">
      {visibleGroups(roleName).map((group) => (
        <div className="mb-7" key={group.title}>
          <p className="px-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">{group.title}</p>
          <div className="mt-2 space-y-1">
            {group.items.map((item) => (
              <AdminNavItemView
                isOpen={!!open[item.label]}
                item={item}
                key={`${group.title}-${item.label}`}
                onNavigate={onNavigate}
                onToggle={toggle}
                pathname={pathname}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
