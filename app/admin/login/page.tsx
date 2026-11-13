import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/storefront/shared/Logo";
import { STORE_NAME } from "@/lib/constants/store";
import { AdminLoginForm } from "./_components/admin-login-form";

export const metadata: Metadata = { title: `Sign in | ${STORE_NAME} Admin` };

/** Staff sign-in, under the same logo as the storefront header. */
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-12">
      <div className="flex w-full max-w-[420px] flex-col items-center rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
        <Link className="mb-6 inline-flex" href="/" aria-label={`${STORE_NAME} home`}>
          <Logo kechi className="h-20" />
        </Link>
        <h1 className="mb-1 text-lg font-semibold text-stone-900">Sign in to the admin</h1>
        <p className="mb-7 text-sm text-stone-500">Staff accounts only. Shoppers sign in on the storefront.</p>
        <Suspense fallback={null}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
