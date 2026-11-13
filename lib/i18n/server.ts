import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./locales";
import { MESSAGES, type Messages } from "./messages";

/** The visitor's language from the cookie; English until they switch. */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getMessages(): Promise<{ locale: Locale; t: Messages }> {
  const locale = await getLocale();
  return { locale, t: MESSAGES[locale] };
}
