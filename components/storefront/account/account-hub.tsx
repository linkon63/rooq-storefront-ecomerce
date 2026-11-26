"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FiMapPin, FiPackage, FiRotateCcw } from "react-icons/fi";
import { MobileSignOut } from "../shell/mobile-sign-out";
import { MenuRow } from "./menu-row";

const SHORTCUTS = [
  { tab: "orders", label: "Orders", Icon: FiPackage },
  { tab: "returns", label: "Returns", Icon: FiRotateCcw },
  { tab: "addresses", label: "Addresses", Icon: FiMapPin },
] as const;

type Props = { name: string | null; onSignIn?: () => void; children: ReactNode };

/** The phone "Me" screen: who you are, order shortcuts, then every help link. */
export function AccountHub({ name, onSignIn, children }: Props) {
  return (
    <div className="flex flex-col gap-6 pb-6 md:hidden">
      {onSignIn ? (
        <div className="flex flex-col gap-3 rounded bg-selvedge/50 p-4">
          <p className="text-sm">Sign in to see your orders, returns and saved addresses.</p>
          <button type="button" onClick={onSignIn} className="press h-12 rounded bg-ink text-sm font-semibold text-chalk">
            Sign in
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid size-14 place-items-center rounded-full bg-ink text-xl text-chalk">
            {name?.charAt(0).toUpperCase()}
          </span>
          <p className="min-w-0 truncate text-lg font-semibold">{name}</p>
        </div>
      )}
      <ul className="grid grid-cols-3 gap-2">
        {SHORTCUTS.map(({ tab, label, Icon }) => (
          <li key={tab}>
            <Link href={`/profile?tab=${tab}`} className="press flex flex-col items-center gap-2 rounded border border-line py-4 text-sm">
              <Icon aria-hidden className="size-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      {onSignIn ? null : (
        <ul className="divide-y divide-selvedge border-y border-selvedge">
          <MenuRow href="/profile?tab=details" label="Details and password" />
        </ul>
      )}
      {children}
      {onSignIn ? null : (
        <ul>
          <MobileSignOut label="Sign out" onDone={() => undefined} />
        </ul>
      )}
    </div>
  );
}
