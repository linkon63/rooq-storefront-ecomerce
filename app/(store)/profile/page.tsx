import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/components/storefront/account/account-view";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function ProfilePage() {
  return (
    <div className="page-gutter pt-8 md:pt-12">
      <h1 className="mb-6 font-display font-expanded text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none">Your account</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded bg-selvedge" />}>
        <AccountView />
      </Suspense>
    </div>
  );
}
