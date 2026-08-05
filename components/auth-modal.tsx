"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useAuth } from "@/app/_providers/auth-provider";
import { useGoogleLogin } from "@react-oauth/google";
import { LuX, LuEye, LuEyeOff, LuLoader } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";

type AuthView = "login" | "register";

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, register, loginWithGoogle } = useAuth();

  const [view, setView] = useState<AuthView>("login");
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
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchView = () => {
    const next = view === "login" ? "register" : "login";
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

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (view === "register") {
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
      if (view === "login") {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
      <div className="relative w-full max-w-3xl bg-[#f4f7ee] shadow-2xl rounded-2xl overflow-hidden flex p-2.5 gap-2.5 border border-[#4a9e2f]/30">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute bg-white p-2 rounded-full top-5 right-5 z-20 text-stone-500 hover:text-[#4a9e2f] transition-colors shadow-sm cursor-pointer"
          aria-label="Close"
        >
          <LuX className="w-5 h-5" />
        </button>

        {/* Left Form Section */}
        <div className="w-full md:w-3/5 px-6 py-8 sm:p-10 bg-white rounded-xl flex flex-col justify-center">
          
          <div className="text-center mb-6">
            <Image
              src="/assets/Logo-English.png"
              alt="Organishi Logo"
              width={140}
              height={44}
              className="h-10 w-auto object-contain mx-auto mb-2"
              priority
            />
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#1f2a17] tracking-tight">
              {view === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="mt-1 text-xs text-stone-500 font-inter">
              {view === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={switchView}
                    className="font-bold text-[#4a9e2f] hover:text-[#3d8626] transition-colors cursor-pointer"
                  >
                    SIGN UP
                  </button>
                </>
              ) : (
                <>
                  Already a member?{" "}
                  <button
                    type="button"
                    onClick={switchView}
                    className="font-bold text-[#4a9e2f] hover:text-[#3d8626] transition-colors cursor-pointer"
                  >
                    LOG IN
                  </button>
                </>
              )}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-700 font-inter">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 font-gotham">
            {view === "register" && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-semibold text-[#1f2a17] mb-1">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#4a9e2f] focus:ring-1 focus:ring-[#4a9e2f] transition-all font-inter"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-[#1f2a17] mb-1">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#4a9e2f] focus:ring-1 focus:ring-[#4a9e2f] transition-all font-inter"
              />
            </div>

            <div className={`grid items-center justify-between gap-3 w-full ${view === "login" ? "grid-cols-1" : "sm:grid-cols-2"}`}>
              <div className="w-full">
                <label htmlFor="auth-password" className="block text-xs font-semibold text-[#1f2a17] mb-1">
                  {view === "login" ? "Password" : "Password"}
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={view === "login" ? "Enter password" : "New password"}
                    className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 pr-9 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#4a9e2f] focus:ring-1 focus:ring-[#4a9e2f] transition-all font-inter"
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

              {view === "register" && (
                <div>
                  <label htmlFor="auth-confirm-password" className="block text-xs font-semibold text-[#1f2a17] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full border border-stone-200 rounded-lg px-3.5 py-2.5 pr-9 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:border-[#4a9e2f] focus:ring-1 focus:ring-[#4a9e2f] transition-all font-inter"
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
            </div>

            {view === "login" && (
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="remember-login"
                  checked={rememberLogin}
                  onChange={(e) => setRememberLogin(e.target.checked)}
                  className="w-4 h-4 accent-[#4a9e2f] cursor-pointer rounded"
                />
                <label htmlFor="remember-login" className="text-xs text-stone-600 font-inter cursor-pointer">
                  Remember login
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#4a9e2f] hover:bg-[#3d8626] text-white py-3.5 rounded-full font-gotham font-bold text-xs tracking-wider uppercase transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {submitting && <LuLoader className="w-4 h-4 animate-spin" />}
              {submitting
                ? view === "login"
                  ? "LOGGING IN..."
                  : "SIGNING UP..."
                : view === "login"
                  ? "LOG IN"
                  : "SIGN UP"}
            </button>
          </form>

          {/* Social login */}
          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-stone-400 font-inter">Or continue with</span>
              </div>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                disabled={googleLoading || submitting}
                className="w-full flex items-center justify-center gap-2 border border-stone-200 py-2.5 rounded-full hover:bg-stone-50 transition-colors font-gotham text-xs font-semibold text-stone-700 cursor-pointer shadow-xs disabled:opacity-60"
              >
                {googleLoading ? <LuLoader className="w-4 h-4 animate-spin" /> : <FcGoogle className="w-4 h-4" />}
                {googleLoading ? "Connecting..." : "Google"}
              </button>
            </div>
          </div>

        </div>

        {/* Right Decorative Section with Organic Food Image */}
        <div className="hidden md:flex md:w-2/5 relative rounded-xl overflow-hidden flex-col justify-end p-6 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80')" }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f2a17]/90 via-[#1f2a17]/40 to-transparent" />
          
          <div className="relative z-10 text-white">
            <span className="inline-block px-3 py-1 bg-[#4a9e2f] text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-2">
              100% Pure & Organic
            </span>
            <h3 className="font-display text-xl font-bold leading-tight">
              Fresh Organic Produce Delivered To Your Doorstep
            </h3>
            <p className="font-inter text-xs text-stone-200 mt-1 leading-relaxed">
              Join Organishi for exclusive organic collections, farm-fresh offers, and quick tracking.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
