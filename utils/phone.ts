/**
 * Folds every Bangladeshi phone shape — 01XXXXXXXXX, +8801XXXXXXXXX,
 * 1XXXXXXXXX and the "+880" + "01XXXXXXXXX" double-zero a country-code picker
 * produces — into 01XXXXXXXXX, the one form stored and looked up.
 */
const BD_MOBILE = /^\+?(?:880?)?0*(1[3-9]\d{8})$/;
const PHONE_NOISE = /[\s\-()]/g;

export function normalizeBdPhone(phone?: string | null): string {
  if (!phone) return "";
  const clean = phone.replace(PHONE_NOISE, "");
  const bd = clean.match(BD_MOBILE);
  if (bd) return `0${bd[1]}`;
  if (clean.startsWith("+88")) return clean.slice(3);
  if (clean.startsWith("88")) return clean.slice(2);
  return clean;
}

/** Every stored form a phone may have been saved in, for lookups. */
export function phoneVariants(phone: string): string[] {
  const trimmed = phone.trim();
  const clean = normalizeBdPhone(trimmed);
  return Array.from(
    new Set([trimmed, clean, clean ? `+88${clean}` : "", clean ? `88${clean}` : ""].filter(Boolean)),
  );
}
