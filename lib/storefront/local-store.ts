/**
 * localStorage wrapped for the cases where it throws or is empty (private
 * windows, blocked site data, SSR). Reads never throw; a malformed value
 * answers the fallback. Values are validated by the caller's guard.
 */

export function readStored<T>(key: string, isValid: (value: unknown) => value is T, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the in-memory state still works for this visit.
  }
}

export function removeStored(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore: nothing to clean up.
  }
}

/** Guard for arrays of objects that carry the given string keys. */
export function isRecordList(keys: readonly string[]) {
  return (value: unknown): value is Record<string, unknown>[] =>
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        keys.every((key) => typeof (entry as Record<string, unknown>)[key] === "string"),
    );
}
