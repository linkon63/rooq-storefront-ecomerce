import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInPanel } from "@/components/storefront/auth/sign-in-panel";
import Logo from "@/components/storefront/shared/Logo";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="page-gutter grid gap-10 py-10 md:grid-cols-2 md:py-16">
      <div>
        <Logo kechi className="mb-6 h-20" />
        <h1 className="font-display font-expanded text-[clamp(2.25rem,8vw,4rem)] font-extrabold leading-[0.95]">Sign in</h1>
        <p className="mt-4 max-w-[40ch] text-stone">Track orders, start a return in two taps, and keep your bag and wishlist on every device.</p>
      </div>
      <Suspense fallback={null}>
        <SignInPanel />
      </Suspense>
    </div>
  );
}
