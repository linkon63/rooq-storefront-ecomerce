"use client";

import { useState } from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";

export function PasswordField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-stone-700" htmlFor="admin-password">
        Password
      </label>
      <div className="relative">
        <FiLock aria-hidden className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          autoComplete="current-password"
          className="w-full rounded-lg border border-stone-300 bg-white py-3 pl-10 pr-11 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
          id="admin-password"
          name="password"
          onChange={(event) => onChange(event.target.value)}
          required
          type={visible ? "text" : "password"}
          value={value}
        />
        <button
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-stone-400 transition hover:text-stone-700"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
