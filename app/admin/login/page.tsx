import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { STORE_NAME } from "@/lib/constants/store";
import { getStoreSettings } from "@/lib/server/settings/service";
import { AdminLoginForm } from "./_components/admin-login-form";

export const metadata: Metadata = { title: `Sign in | ${STORE_NAME} Admin` };

/** Logo + name from Settings; falls back to the wordmark if the DB is unreachable. */
async function loadBrand(): Promise<{ name: string; logo: string | null }> {
  await connection();
  try {
    const settings = await getStoreSettings();
    return { name: settings?.shopName ?? STORE_NAME, logo: settings?.logo ?? null };
  } catch {
    return { name: STORE_NAME, logo: null };
  }
}

export default async function AdminLoginPage() {
  const brand = await loadBrand();

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-12">
      <div className="flex w-full max-w-[420px] flex-col items-center rounded-2xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
        <Link className="mb-6 inline-flex items-center gap-3" href="/">
          {brand.logo ? (
            <Image
              alt=""
              className="h-12 w-12 object-contain"
              height={48}
              priority
              src={brand.logo}
              unoptimized={!brand.logo.startsWith("/")}
              width={48}
            />
          ) : null}
          <span className="text-2xl font-semibold tracking-tight text-stone-900">{brand.name}</span>
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
