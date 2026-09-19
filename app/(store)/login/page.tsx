"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/_providers/auth-provider";
import { useGoogleLogin } from "@react-oauth/google";
import { LuEye, LuEyeOff, LuLoader } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import Logo from "@/components/storefront/shared/Logo";
import { AuthBrandPanel, AuthTabs, INPUT_CLASS, LABEL_CLASS } from "@/components/auth-ui";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/utils";

type AuthTab = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, register, loginWithGoogle } = useAuth();

  const [tab, setTab] = useState<AuthTab>("login");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // If already authenticated, redirect to profile
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/profile");
    }
  }, [isAuthenticated, router]);

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setGoogleLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        router.push("/profile");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setGoogleLoading(false);
      setError("Google sign-in was cancelled or failed.");
    },
  });

  const resetForm = () => {
    setName("");
    setIdentifier("");
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchTab = (nextTab: AuthTab) => {
    setTab(nextTab);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (tab === "login") {
      if (!identifier.trim() || !password.trim()) {
        setError("Please enter your email/phone and password.");
        return;
      }

      const trimmed = identifier.trim();
      const isEmail = trimmed.includes("@");
      const isPhone = isValidBdPhone(trimmed);
      if (!isEmail && !isPhone) {
        setError("Please enter a valid email address or Bangladeshi phone number (e.g. 017XXXXXXXX or +88017XXXXXXXX).");
        return;
      }

      const finalIdentifier = isPhone ? normalizeBdPhone(trimmed) : trimmed;

      setSubmitting(true);
      try {
        await login(finalIdentifier, password);
        router.push("/profile");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid credentials.");
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
        setError("All fields (Name, Email, Phone, Password) are required for registration.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("Please enter a valid email address.");
        return;
      }

      if (!isValidBdPhone(phone.trim())) {
        setError("Please enter a valid 11-digit Bangladeshi phone number (e.g. 017XXXXXXXX or +88017XXXXXXXX).");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      setSubmitting(true);
      try {
        await register(name.trim(), email.trim(), normalizeBdPhone(phone.trim()), password);
        router.push("/profile");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    // 128px is the sticky header above (40px top bar + 88px main bar): subtracting
    // it is what makes the panel fill the screen the visitor can actually see.
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-brand-mist px-4 py-8 sm:px-6 sm:py-10 md:min-h-[calc(100vh-128px)]">
      {/* Soft brand glows so the full-height background never reads as flat paper. */}
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />

      {/* The card tracks the viewport height so the page fills the screen on a
          desktop (128px header + 80px of page padding removed), and falls back
          to its natural height wherever the form needs more room. */}
      <div className="relative grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-brand/15 bg-white shadow-[0_30px_80px_-30px_rgba(31,42,23,0.45)] md:min-h-[calc(100vh-208px)] md:grid-cols-2">

        {/* Left Form Section */}
        <div className="flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-12">

          {/* Brand mark for the small screens where the right panel is hidden. */}
          <Link href="/" aria-label="Organishi home" className="mb-4 inline-block md:hidden">
            <Logo className="h-16" />
          </Link>

          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#1f2a17]">
              {tab === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="font-inter mt-2 text-sm text-stone-500">
              {tab === "login"
                ? "Log in to track your orders and pick up where you left off."
                : "Join Organishi for farm-fresh organic deliveries."}
            </p>
          </div>

          <AuthTabs value={tab} onChange={switchTab} className="mb-6" />

          {error && (
            <div className="font-inter mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-gotham">
            {tab === "login" ? (
              <div>
                <label htmlFor="page-auth-identifier" className={LABEL_CLASS}>
                  Email or Phone Number *
                </label>
                <input
                  id="page-auth-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter email or phone number (e.g. 017XXXXXXXX)"
                  className={INPUT_CLASS}
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="page-auth-name" className={LABEL_CLASS}>
                    Full Name *
                  </label>
                  <input
                    id="page-auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className={INPUT_CLASS}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="page-auth-email" className={LABEL_CLASS}>
                      Email Address *
                    </label>
                    <input
                      id="page-auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className={INPUT_CLASS}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="page-auth-phone" className={LABEL_CLASS}>
                      Phone Number *
                    </label>
                    <input
                      id="page-auth-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className={INPUT_CLASS}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className={`grid w-full items-start gap-4 ${tab === "login" ? "grid-cols-1" : "sm:grid-cols-2"}`}>
              <div className="w-full">
                <label htmlFor="page-auth-password" className={LABEL_CLASS}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="page-auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tab === "login" ? "Enter password" : "New password"}
                    className={`${INPUT_CLASS} pr-11`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-stone-400 hover:text-stone-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {tab === "register" && (
                <div>
                  <label htmlFor="page-auth-confirm-password" className={LABEL_CLASS}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="page-auth-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className={`${INPUT_CLASS} pr-11`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-stone-400 hover:text-stone-700"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <LuEyeOff className="h-4 w-4" /> : <LuEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {tab === "login" && (
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="page-remember-login"
                  checked={rememberLogin}
                  onChange={(e) => setRememberLogin(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded accent-brand"
                />
                <label htmlFor="page-remember-login" className="font-inter cursor-pointer text-xs text-stone-600">
                  Remember login
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand py-3.5 font-gotham text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-brand/25 transition-all hover:bg-brand-dark hover:shadow-xl hover:shadow-brand/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            >
              {submitting && <LuLoader className="h-4 w-4 animate-spin" />}
              {submitting
                ? tab === "login"
                  ? "LOGGING IN..."
                  : "SIGNING UP..."
                : tab === "login"
                  ? "LOG IN"
                  : "SIGN UP"}
            </button>
          </form>

          <p className="font-inter mt-6 text-center text-xs text-stone-400">
            <Link href="/" className="transition-colors hover:text-brand">
              ← Back to shop
            </Link>
          </p>
        </div>

        <AuthBrandPanel mode={tab} />

      </div>
    </main>
  );
}
