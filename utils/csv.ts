/** RFC 4180-ish CSV helpers (pure). */

export function escapeCsv(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function toCsv(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsv).join(","));
  return [...lines, ""].join("\n");
}
