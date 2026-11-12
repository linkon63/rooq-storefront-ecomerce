import type { ButtonHTMLAttributes } from "react";

type Tone = "primary" | "secondary" | "danger" | "ghost";

const TONES: Record<Tone, string> = {
  primary: "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

export function Button({ tone = "primary", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${TONES[tone]} ${className}`}
      {...props}
    />
  );
}

export function IconButton({ label, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid h-8 w-8 place-items-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-40 ${className}`}
      {...props}
    />
  );
}
