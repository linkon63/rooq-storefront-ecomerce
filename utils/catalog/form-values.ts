/** "" → null, otherwise the trimmed string (optional text inputs). */
export function textOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/** "" → null, otherwise a finite number (optional numeric inputs). */
export function numberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** "" → undefined so the field is left unchanged. */
export function numberOrUndefined(value: string): number | undefined {
  return numberOrNull(value) ?? undefined;
}

/** Multi-line textarea → list of non-empty trimmed lines. */
export function linesToList(value: string): string[] {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function toggleInList<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/** Move the item at `from` one step up (-1) or down (+1). */
export function moveItem<T>(list: readonly T[], from: number, step: -1 | 1): T[] {
  const to = from + step;
  if (to < 0 || to >= list.length) return [...list];
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/** ISO string → value for <input type="datetime-local">. */
export function toDateTimeInput(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function fromDateTimeInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export function formatAdminDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

export function formatAdminDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}
