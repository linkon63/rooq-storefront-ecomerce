const KEY = "rooq.searches";
const LIMIT = 6;

/** The shopper's latest search terms, newest first; empty when storage is unavailable. */
export function readRecentSearches(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

export function rememberSearch(term: string): void {
  try {
    const next = [term, ...readRecentSearches().filter((entry) => entry !== term)].slice(0, LIMIT);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the search still runs.
  }
}
