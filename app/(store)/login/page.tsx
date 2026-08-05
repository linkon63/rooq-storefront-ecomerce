"use client";

import { useState, FormEvent, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/_providers/auth-provider";
import { useGoogleLogin } from "@react-oauth/google";
import { LuEye, LuEyeOff, LuLoader } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";

type AuthTab = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, register, loginWithGoogle } = useAuth();

  const [tab, setTab] = useState<AuthTab>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
    setEmail("");
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

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (tab === "register") {
      if (!name.trim()) {
        setError("Please enter your name.");
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
    }

    setSubmitting(true);
    try {
      if (tab === "login") {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grow bg-[#f4f7ee] w-full min-h-screen py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#4a9e2f]/20 p-6 sm:p-8 font-gotham">
        
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" aria-label="Organishi home" className="inline-block mb-3">
            <Image
              src="/assets/Logo-English.png"
              alt="Organishi"
              width={160}
              height={50}
              className="h-12 w-auto object-contain mx-auto"
              priority
            />
          </Link>
          <p className="text-xs text-stone-500 font-inter">Pure Organic Food, Straight From the Farm</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 mb-6">
          <button
            type="button"
            onClick={() => switchTab("login")}
            className={`flex-1 py-3 text-center text-sm font-bold tracking-wider uppercase transition-colors cursor-pointer border-b-2 ${
              tab === "login"
                ? "border-[#4a9e2f] text-[#4a9e2f]"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => switchTab("register")}
            className={`flex-1 py-3 text-center text-sm font-bold tracking-wider uppercase transition-colors cursor-pointer border-b-2 ${
              tab === "register"
                ? "border-[#4a9e2f] text-[#4a9e2f]"
                : "border-transparent text-stone-400 hover:text-stone-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs text-rose-700 font-inter">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "register" && (
            <div>
              <label htmlFor="login-name" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Full Name
              </label>
              <input
                id="login-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#4a9e2f] focus:ring-1 focus:ring-[#4a9e2f] transition-all font-inter"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#4a9e2f] focus:ring-1 focus:ring-[#4a9e2f] transition-all font-inter"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#4a9e2f] focus:ring-1 focus:ring-[#4a9e2f] transition-all font-inter"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {tab === "register" && (
            <div>
              <label htmlFor="login-confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="login-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#4a9e2f] focus:ring-1 focus:ring-[#4a9e2f] transition-all font-inter"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {tab === "login" && (
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-stone-600 font-inter">
                <input
                  type="checkbox"
                  checked={rememberLogin}
                  onChange={(e) => setRememberLogin(e.target.checked)}
                  className="w-4 h-4 accent-[#4a9e2f] cursor-pointer rounded"
                />
                Remember me
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#4a9e2f] hover:bg-[#3d8626] text-white py-3.5 rounded-full font-gotham font-bold text-xs tracking-wider uppercase transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {submitting && <LuLoader className="w-4 h-4 animate-spin" />}
            {submitting
              ? tab === "login"
                ? "Logging In..."
                : "Signing Up..."
              : tab === "login"
                ? "Log In"
                : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-stone-400 font-inter">Or continue with</span>
          </div>
        </div>

        {/* Social Buttons */}
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          disabled={googleLoading || submitting}
          className="w-full flex items-center justify-center gap-2 border border-stone-200 py-3 rounded-full hover:bg-stone-50 transition-colors font-gotham text-xs font-semibold text-stone-700 cursor-pointer shadow-xs disabled:opacity-60"
        >
          {googleLoading ? <LuLoader className="w-4 h-4 animate-spin" /> : <FcGoogle className="w-5 h-5" />}
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

      </div>
    </main>
  );
}
