const KEY = "rooq.install";
const SESSION_KEY = "rooq.install.session";

/**
 * Counts browser sessions and answers once, from the second one on, that the
 * install offer is due. False whenever storage is unavailable.
 */
export function shouldOfferInstall(): boolean {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return false;
    sessionStorage.setItem(SESSION_KEY, "1");
    const stored = localStorage.getItem(KEY);
    if (stored === "offered") return false;
    const visits = Number(stored ?? 0) + 1;
    localStorage.setItem(KEY, visits >= 2 ? "offered" : String(visits));
    return visits >= 2;
  } catch {
    return false;
  }
}
