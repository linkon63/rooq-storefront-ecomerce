"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/app/_providers/auth-provider";
import { useGoogleLogin } from "@react-oauth/google";
import { LuX, LuEye, LuEyeOff, LuLoader } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import Logo from "@/components/storefront/shared/Logo";
import { AuthBrandPanel, AuthTabs, INPUT_CLASS, LABEL_CLASS } from "@/components/auth-ui";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/utils";

type AuthView = "login" | "register";

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, register, loginWithGoogle } = useAuth();

  const [view, setView] = useState<AuthView>("login");
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

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      setGoogleLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
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

  if (!showAuthModal) return null;

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

  const switchView = (next: AuthView) => {
    setView(next);
    resetForm();
  };

  const handleClose = () => {
    setShowAuthModal(false);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (view === "login") {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-xs">
      {/* Same two-column design as the /login page, sized to sit inside the
          viewport: the form column scrolls when the register fields outgrow it. */}
      <div className="relative grid max-h-[92vh] w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-[#4a9e2f]/15 bg-white shadow-[0_30px_80px_-30px_rgba(31,42,23,0.65)] md:grid-cols-2">

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 cursor-pointer rounded-full bg-white/90 p-2 text-stone-500 shadow-sm transition-colors hover:text-[#4a9e2f] md:right-[calc(50%+1rem)]"
          aria-label="Close"
        >
          <LuX className="h-5 w-5" />
        </button>

        {/* Left Form Section */}
        <div className="flex max-h-[92vh] flex-col justify-center overflow-y-auto px-6 py-9 sm:px-9 sm:py-10">

          {/* Brand mark for the small screens where the right panel is hidden. */}
          <Logo className="mb-4 h-14 md:hidden" />

          <div className="mb-5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#1f2a17] sm:text-3xl">
              {view === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="font-inter mt-2 text-sm text-stone-500">
              {view === "login"
                ? "Log in to track your orders and pick up where you left off."
                : "Join Organishi for farm-fresh organic deliveries."}
            </p>
          </div>

          <AuthTabs value={view} onChange={switchView} className="mb-5" />

          {error && (
            <div className="font-inter mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-gotham">
            {view === "login" ? (
              <div>
                <label htmlFor="auth-identifier" className={LABEL_CLASS}>
                  Email or Phone Number *
                </label>
                <input
                  id="auth-identifier"
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
                  <label htmlFor="auth-name" className={LABEL_CLASS}>
                    Full Name *
                  </label>
                  <input
                    id="auth-name"
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
                    <label htmlFor="auth-email" className={LABEL_CLASS}>
                      Email Address *
                    </label>
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className={INPUT_CLASS}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="auth-phone" className={LABEL_CLASS}>
                      Phone Number *
                    </label>
                    <input
                      id="auth-phone"
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

            <div className={`grid w-full items-start gap-4 ${view === "login" ? "grid-cols-1" : "sm:grid-cols-2"}`}>
              <div className="w-full">
                <label htmlFor="auth-password" className={LABEL_CLASS}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={view === "login" ? "Enter password" : "New password"}
                    className={`${INPUT_CLASS} pr-11`}
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

              {view === "register" && (
                <div>
                  <label htmlFor="auth-confirm-password" className={LABEL_CLASS}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className={`${INPUT_CLASS} pr-11`}
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

            {view === "login" && (
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="remember-login"
                  checked={rememberLogin}
                  onChange={(e) => setRememberLogin(e.target.checked)}
                  className="h-4 w-4 cursor-pointer rounded accent-[#4a9e2f]"
                />
                <label htmlFor="remember-login" className="font-inter cursor-pointer text-xs text-stone-600">
                  Remember login
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#4a9e2f] py-3.5 font-gotham text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#4a9e2f]/25 transition-all hover:bg-[#3d8626] hover:shadow-xl hover:shadow-[#4a9e2f]/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            >
              {submitting && <LuLoader className="h-4 w-4 animate-spin" />}
              {submitting
                ? view === "login"
                  ? "LOGGING IN..."
                  : "SIGNING UP..."
                : view === "login"
                  ? "LOG IN"
                  : "SIGN UP"}
            </button>
          </form>
        </div>

        <AuthBrandPanel mode={view} compact />

      </div>
    </div>
  );
}
