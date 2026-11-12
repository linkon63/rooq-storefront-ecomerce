"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { ACCOUNT_TABS } from "@/lib/constants/storefront";
import { accountTabFrom } from "@/utils/storefront/account";
import { LoginForm } from "../auth/login-form";
import { WishlistGrid } from "../wishlist/wishlist-grid";
import { AddressesPanel } from "./addresses-panel";
import { DetailsPanel } from "./details-panel";
import { OrdersPanel } from "./orders-panel";
import { ReturnsPanel } from "./returns-panel";

/** Account hub. The tab lives in `?tab=` so links like "Start a return" land on the right panel. */
export function AccountView() {
  const tab = accountTabFrom(useSearchParams().get("tab"));
  const { status, user, openAuth } = useSession();

  if (status === "unknown") return <div className="h-96 animate-pulse rounded bg-selvedge" aria-busy="true" aria-label="Loading your account" />;

  if (status === "guest") {
    return (
      <div className="grid max-w-md gap-6">
        <p className="text-stone">Sign in to see your orders, returns and saved addresses.</p>
        <LoginForm />
        <button type="button" onClick={() => openAuth("register")} className="w-fit text-sm underline underline-offset-4">
          New here? Create an account
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="text-stone">Signed in as {user?.name}</p>
      <nav aria-label="Account" className="rail-scroll -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
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
  );
}
