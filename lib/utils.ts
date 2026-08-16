export function toISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

/**
 * Validates a Bangladeshi phone number.
 * Accepts formats: 01XXXXXXXXX (11 digits, operator 013-019), +8801XXXXXXXXX, or 8801XXXXXXXXX.
 */
export function isValidBdPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[\s\-()]/g, "");
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(clean);
}

/**
 * Normalizes a Bangladeshi phone number to standard 11-digit format (e.g. 017XXXXXXXX).
 */
export function normalizeBdPhone(phone: string): string {
  const clean = phone.replace(/[\s\-()]/g, "");
  if (clean.startsWith("+88")) {
    return clean.slice(3);
  }
  if (clean.startsWith("88")) {
    return clean.slice(2);
  }
  return clean;
}
