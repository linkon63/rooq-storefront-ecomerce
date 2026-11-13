"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/locales";
import { setLocaleCookie } from "@/lib/i18n/set-locale-cookie";
import type { Messages } from "@/lib/i18n/messages";

type LanguageSwitchProps = { locale: Locale; labels: Messages["language"]; tone?: "dark" | "light" };

/** English / বাংলা toggle. Stores the choice in a cookie, then re-renders the server tree. */
export function LanguageSwitch({ locale, labels, tone = "dark" }: LanguageSwitchProps) {
  const router = useRouter();
  const choose = (next: Locale) => {
    if (next === locale) return;
    setLocaleCookie(next);
    router.refresh();
  };
  return (
    <div role="group" aria-label={labels.switchTo} className={`inline-flex items-center overflow-hidden rounded-sm border ${tone === "dark" ? "border-chalk/30" : "border-ink/30"}`}>
      {(["en", "bn"] as const).map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={locale === code}
          onClick={() => choose(code)}
          className={`px-2 py-0.5 text-[0.6875rem] transition-colors ${locale === code ? (tone === "dark" ? "bg-chalk text-ink" : "bg-ink text-chalk") : tone === "dark" ? "hover:bg-chalk/15" : "hover:bg-ink/10"}`}
        >
          {labels[code]}
        </button>
      ))}
    </div>
  );
}
