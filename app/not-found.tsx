import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/storefront/shared/Logo";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-chalk px-4 text-ink">
      <div className="max-w-md text-center">
        <Logo className="mx-auto h-9" />
        <p className="mt-10 font-display text-6xl font-extrabold tracking-tight">404</p>
        <h1 className="mt-3 text-xl font-semibold">This page has moved on</h1>
        <p className="mt-2 text-sm text-stone">The link may be old, or the item is no longer in the collection.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link className="inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-chalk" href="/shop">
            Shop new arrivals
          </Link>
          <Link className="inline-flex h-11 items-center rounded-full border border-ink px-6 text-sm font-semibold" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
