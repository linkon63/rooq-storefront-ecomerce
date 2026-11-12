"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiLoader, FiMail } from "react-icons/fi";
import { apiRequest, setAdminSession } from "@/lib/admin/http";
import type { AdminUser } from "@/types/admin/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { isStaffRole } from "@/utils/roles";
import { PasswordField } from "./password-field";

type LoginResponse = { accessToken: string; user: AdminUser };

/** Only same-panel redirects are honoured (no open redirect). */
function safeNext(next: string | null): string {
  return next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin/dashboard";
}

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await apiRequest<LoginResponse>("/auth/login", {
        auth: false,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      if (!isStaffRole(response.user.role?.name)) throw new Error(ERROR_MESSAGES.auth.adminOnly);
      setAdminSession(response.accessToken, response.user);
      router.replace(safeNext(searchParams.get("next")));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : ERROR_MESSAGES.auth.loginFailed);
      setIsSubmitting(false);
    }
  }

  return (
    <form className="w-full space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-stone-700" htmlFor="admin-identifier">
          Email or phone number
        </label>
        <div className="relative">
          <FiMail aria-hidden className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            autoComplete="username"
            className="w-full rounded-lg border border-stone-300 bg-white py-3 pl-10 pr-4 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
            id="admin-identifier"
            name="identifier"
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="you@rooq.com"
            required
            spellCheck={false}
            type="text"
            value={identifier}
          />
        </div>
      </div>

      <PasswordField onChange={setPassword} value={password} />

      <p aria-live="polite" className={error ? "rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-snug text-red-700" : "sr-only"} role={error ? "alert" : undefined}>
        {error}
      </p>

      <button
        className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-stone-900 py-3.5 text-sm font-semibold text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? <FiLoader aria-hidden className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
