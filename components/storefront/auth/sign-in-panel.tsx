"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { safeNextPath } from "@/utils/storefront/navigation";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";

/** /login: sign in or create an account, then go back to `?next=` (same-site paths only). */
export function SignInPanel() {
  const router = useRouter();
  const next = safeNextPath(useSearchParams().get("next"));
  const { isSignedIn } = useSession();
  const [mode, setMode] = useState<"login" | "register">("login");

  useEffect(() => {
    if (isSignedIn) router.replace(next);
  }, [isSignedIn, next, router]);

  return (
    <div className="flex max-w-md flex-col gap-6">
      <div role="tablist" aria-label="Account" className="flex gap-1 border-b border-line">
        {(["login", "register"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={`-mb-px border-b-2 px-3 py-3 text-sm font-semibold ${mode === value ? "border-ink" : "border-transparent text-stone"}`}
          >
            {value === "login" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>
      {mode === "login" ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
