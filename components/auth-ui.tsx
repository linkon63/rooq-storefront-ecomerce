"use client";

import Link from "next/link";
import { LuLeaf, LuShieldCheck, LuTruck } from "react-icons/lu";

import Logo from "@/components/storefront/shared/Logo";

/**
 * The pieces the /login page and the site-wide auth modal both draw from, so
 * the modal that opens over the profile page is the same design as the page.
 */

export type AuthMode = "login" | "register";

/** Every auth field shares one look, so the classes live here once. */
export const INPUT_CLASS =
  "w-full rounded-xl border border-stone-200 bg-[#fbfcf8] px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-all focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 font-inter";

export const LABEL_CLASS = "block text-xs font-semibold text-[#1f2a17] mb-1.5 font-gotham";

/** Sales points on the brand panel — shown in place of the old stock photo. */
const BRAND_HIGHLIGHTS = [
  { icon: LuLeaf, text: "Certified organic, straight from local farms" },
  { icon: LuTruck, text: "Fast delivery with live order tracking" },
  { icon: LuShieldCheck, text: "Secure checkout and easy returns" },
];

/** Log in / Sign up switch, styled as one segmented control. */
export function AuthTabs({
  value,
  onChange,
  className = "",
}: {
  value: AuthMode;
  onChange: (next: AuthMode) => void;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-2 gap-1 rounded-full border border-brand/15 bg-brand-mist p-1 ${className}`}
    >
      {(["login", "register"] as AuthMode[]).map((mode) => (
        <button
          key={mode}
          type="button"
          // Re-selecting the open tab would only wipe what has been typed.
          onClick={() => mode !== value && onChange(mode)}
          aria-pressed={value === mode}
          className={`cursor-pointer rounded-full py-2.5 font-gotham text-xs font-bold uppercase tracking-wider transition-all ${
            value === mode ? "bg-brand text-white shadow-sm" : "text-stone-500 hover:text-[#1f2a17]"
          }`}
        >
          {mode === "login" ? "Log in" : "Sign up"}
        </button>
      ))}
    </div>
  );
}

/**
 * The branded half of the auth layout: the logo carries it, no stock photo.
 * `className` sets how the column sizes itself in each host.
 */
export function AuthBrandPanel({
  mode,
  className = "",
  compact = false,
}: {
  mode: AuthMode;
  className?: string;
  /** Tightens the spacing for the modal, which has far less height to spend. */
  compact?: boolean;
}) {
  return (
    <div
      className={`relative hidden flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-brand via-brand-dark to-[#1f2a17] text-center text-white md:flex ${
        compact ? "p-8" : "p-10"
      } ${className}`}
    >
      {/* Decorative rings and a dot grid, all purely ornamental. */}
      <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/15" />
      <div aria-hidden className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-white/5" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div className="relative z-10 flex flex-col items-center">
        <Link
          href="/"
          aria-label="Organishi home"
          className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-sm transition-transform hover:scale-[1.03]"
        >
          <Logo variant="light" className={compact ? "h-20" : "h-24"} />
        </Link>

        <span className="mt-6 inline-block rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
          100% Pure &amp; Organic
        </span>
        <h2 className={`font-display mt-4 font-bold leading-snug ${compact ? "text-xl" : "text-2xl"}`}>
          Fresh organic produce
          <br />
          delivered to your doorstep
        </h2>
        <p className="font-inter mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/75">
          {mode === "login"
            ? "Log in for exclusive organic collections, farm-fresh offers and live order tracking."
            : "Sign up for exclusive organic collections, farm-fresh offers and live order tracking."}
        </p>
      </div>

      <ul className={`relative z-10 w-full max-w-xs space-y-3.5 text-left ${compact ? "mt-7" : "mt-9"}`}>
        {BRAND_HIGHLIGHTS.map(({ icon: Icon, text }) => (
          <li key={text} className="font-inter flex items-center gap-3 text-sm text-white/85">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
              <Icon className="h-4 w-4" />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
