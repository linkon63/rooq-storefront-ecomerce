"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/hooks/use-session";
import { ACCOUNT_TABS } from "@/lib/constants/storefront";
import { accountTabFrom } from "@/utils/storefront/account";
import { LoginForm } from "../auth/login-form";
import { WishlistGrid } from "../wishlist/wishlist-grid";
import { AccountHub } from "./account-hub";
import { AddressesPanel } from "./addresses-panel";
import { DetailsPanel } from "./details-panel";
import { OrdersPanel } from "./orders-panel";
import { ReturnsPanel } from "./returns-panel";

/** Account hub. The tab lives in `?tab=` so links like "Start a return" land on the right panel. */
export function AccountView({ phoneMenu }: { phoneMenu: ReactNode }) {
  const requested = useSearchParams().get("tab");
  const tab = accountTabFrom(requested);
  // Phones without `?tab=` show the menu; a tab is its own screen.
  const onTab = requested ? "" : "max-md:hidden";
  const { status, user, openAuth } = useSession();

  if (status === "unknown") return <div className="h-96 animate-pulse rounded bg-selvedge" aria-busy="true" aria-label="Loading your account" />;

  if (status === "guest") {
    return (
      <>
      {requested ? null : <AccountHub name={null} onSignIn={() => openAuth("login")}>{phoneMenu}</AccountHub>}
      <div className={`mx-auto grid w-full max-w-md gap-6 ${onTab}`}>
        <p className="text-stone">Sign in to see your orders, returns and saved addresses.</p>
        <LoginForm />
        <button type="button" onClick={() => openAuth("register")} className="w-fit text-sm underline underline-offset-4">
          New here? Create an account
        </button>
      </div>
      </>
    );
  }

  return (
    <>
    {requested ? null : <AccountHub name={user?.name ?? null}>{phoneMenu}</AccountHub>}
    <div className={`flex flex-col gap-8 ${onTab}`}>
      <p className="text-stone max-md:hidden">Signed in as {user?.name}</p>
      <nav aria-label="Account" className="rail-scroll -mx-4 overflow-x-auto px-4 max-md:hidden md:mx-0 md:px-0">
        <ul className="flex gap-1 border-b border-line">
          {ACCOUNT_TABS.map((entry) => (
            <li key={entry.key}>
              <Link
                href={`/profile?tab=${entry.key}`}
                replace
                scroll={false}
                aria-current={entry.key === tab ? "page" : undefined}
                className={`-mb-px block whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold ${
                  entry.key === tab ? "border-ink" : "border-transparent text-stone hover:text-ink"
                }`}
              >
                {entry.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {tab === "orders" ? <OrdersPanel /> : null}
      {tab === "returns" ? <ReturnsPanel /> : null}
      {tab === "wishlist" ? <WishlistGrid /> : null}
      {tab === "addresses" ? <AddressesPanel /> : null}
      {tab === "details" ? <DetailsPanel /> : null}
    </div>
    </>
  );
}
