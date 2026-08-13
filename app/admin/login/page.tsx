"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiLoader, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { apiRequest, setAdminSession, type AdminUser } from "../../../lib/admin-api";

type LoginResponse = {
  accessToken: string;
  user: AdminUser;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        body: JSON.stringify({ email, password }),
      });

      if (response.user.role?.name !== "admin") {
        throw new Error("Only admin users can access the admin panel.");
      }

      setAdminSession(response.accessToken, response.user);
      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.replace(nextPath?.startsWith("/admin") ? nextPath : "/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f4f8f3] via-[#FAF9F5] to-[#edf4ea] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[440px] bg-white border border-stone-200/80 p-8 sm:p-10 shadow-xl shadow-stone-200/50 flex flex-col items-center rounded-2xl animate-fadeIn">
        <Link href="/" className="mb-4 inline-block hover:opacity-90 transition-opacity">
          <Image
            src="/assets/Logo-English.png"
            alt="Organishi Logo"
            width={220}
            height={68}
            className="h-14 w-auto object-contain"
            priority
          />
        </Link>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight mb-1">
          Admin Portal
        </h1>
        <p className="text-xs text-slate-500 font-medium mb-6">
          Sign in to manage your store
        </p>

        <div className="flex mb-6 w-full items-center justify-center">
          <span className="px-4 py-1 text-[11px] font-bold tracking-widest uppercase rounded-full bg-[#4a9e2f]/10 text-[#4a9e2f]">
            Administrator Access
          </span>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-800 focus:bg-white focus:border-[#4a9e2f] focus:ring-2 focus:ring-[#4a9e2f]/20 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-3 text-sm text-slate-800 focus:bg-white focus:border-[#4a9e2f] focus:ring-2 focus:ring-[#4a9e2f]/20 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 leading-snug">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#4a9e2f] hover:bg-[#3d8427] text-white font-semibold text-sm py-3.5 rounded-xl shadow-lg shadow-[#4a9e2f]/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-6 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <FiLoader className="animate-spin text-white w-4 h-4" />
            ) : (
              "Log In to Dashboard"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
