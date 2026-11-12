/** Only same-site relative paths are allowed as a post-login destination (no open redirects). */
export function safeNextPath(value: string | null, fallback = "/profile"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
