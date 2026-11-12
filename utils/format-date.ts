/** "Nov 12, 2026" — admin tables print "-" for an empty value. */
export function formatDate(value?: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
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
