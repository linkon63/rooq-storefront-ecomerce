"use client";

import Link from "next/link";
import { AdminIcon } from "../admin-icons";
import type { AdminNavItem } from "./admin-nav";

type Props = {
  item: AdminNavItem;
  pathname: string;
  isOpen: boolean;
  onToggle: (label: string) => void;
  onNavigate?: () => void;
};

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function AdminNavItemView({ item, pathname, isOpen, onToggle, onNavigate }: Props) {
  if (!item.children?.length) {
    const current = isActive(pathname, item.href);
    return (
      <Link
        aria-current={current ? "page" : undefined}
        className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 ${current ? "bg-slate-100 text-slate-950" : ""}`}
        href={item.href}
        onClick={onNavigate}
      >
        <span className="text-slate-500"><AdminIcon name={item.icon} /></span>
        <span className="flex-1">{item.label}</span>
      </Link>
    );
  }

  const parentActive = pathname === item.href || item.children.some((child) => pathname === child.href);
  return (
    <div className="flex flex-col">
      <button
        aria-expanded={isOpen}
        className={`flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 ${parentActive ? "bg-slate-50 font-extrabold text-slate-950" : ""}`}
        onClick={() => onToggle(item.label)}
        type="button"
      >
        <span className="text-slate-500"><AdminIcon name={item.icon} /></span>
        <span className="flex-1 text-left">{item.label}</span>
        <AdminIcon
          className={`h-4 w-4 text-slate-400 transition-transform duration-300 ease-in-out motion-reduce:transition-none ${isOpen ? "rotate-90 text-slate-600" : ""}`}
          name="chevronRight"
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out motion-reduce:transition-none ${isOpen ? "mt-1 grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="ml-5 space-y-1 border-l border-slate-100 py-1 pl-4">
            {item.children.map((child) => {
              const current = pathname === child.href;
              return (
                <Link
                  aria-current={current ? "page" : undefined}
                  className={`flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${current ? "bg-slate-100 font-bold text-slate-950" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  href={child.href}
                  key={child.href + child.label}
                  onClick={onNavigate}
                  tabIndex={isOpen ? undefined : -1}
                >
                  <span className="text-slate-400"><AdminIcon className="h-3.5 w-3.5" name={child.icon} /></span>
                  <span>{child.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
