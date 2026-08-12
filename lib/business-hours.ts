/**
 * Business hours are stored on the settings row as plain 24-hour "HH:mm"
 * strings — that is what `<input type="time">` in Admin → Settings → Contact
 * reads and writes. Everything a shopper sees is formatted from those two
 * strings here, so the admin panel preview and the storefront never disagree.
 */

/** "08:00" → "8:00 AM". Returns null for anything that is not a valid time. */
export function formatHour(value?: string | null): string | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value?.trim() ?? "");
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  const suffix = hours < 12 ? "AM" : "PM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

/**
 * The full label — "8:00 AM – 10:00 PM". Null when either end is missing, so
 * callers can drop the row rather than print half a range.
 */
export function formatOpeningHours(
  openingTime?: string | null,
  closingTime?: string | null,
): string | null {
  const opens = formatHour(openingTime);
  const closes = formatHour(closingTime);
  if (!opens || !closes) return null;
  return `${opens} – ${closes}`;
}
