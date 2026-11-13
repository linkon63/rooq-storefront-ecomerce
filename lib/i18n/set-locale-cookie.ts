import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from "./locales";

/** Browser-side: remember the visitor's language for a year. */
export function setLocaleCookie(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}
