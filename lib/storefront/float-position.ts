const KEY = "rooq.tulo";

/** Where the shopper parked Tulo on a phone: which edge, and how far above the screen bottom. */
export type FloatPosition = { side: "left" | "right"; bottom: number };

export function readFloatPosition(): FloatPosition | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<FloatPosition> | null;
    if (!value || typeof value.bottom !== "number") return null;
    return { side: value.side === "left" ? "left" : "right", bottom: value.bottom };
  } catch {
    return null;
  }
}

export function saveFloatPosition(position: FloatPosition): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(position));
  } catch {
    // Storage blocked: the position lasts until the page is reloaded.
  }
}
