/** Gallery row as loaded for an order line (no media bytes, just the id). */
export type LineGalleryRow = { colorId: string | null; isPrimary: boolean; position: number; mediaId: string };

function byPrimaryThenPosition(a: LineGalleryRow, b: LineGalleryRow): number {
  return Number(b.isPrimary) - Number(a.isPrimary) || a.position - b.position;
}

/**
 * The image an order line snapshots: the colour's primary image, else the
 * shared (colour-less) primary, else anything in the gallery.
 */
export function lineImageMediaId(gallery: readonly LineGalleryRow[], colorId: string): string | null {
  const own = gallery.filter((row) => row.colorId === colorId);
  const shared = gallery.filter((row) => row.colorId === null);
  const pool = own.length ? own : shared.length ? shared : [...gallery];
  return [...pool].sort(byPrimaryThenPosition)[0]?.mediaId ?? null;
}

/** Order-line inputs with the same variant merged into one line. */
export function mergeLines<T extends { variantId: string; quantity: number }>(lines: readonly T[]): T[] {
  const merged = new Map<string, T>();
  for (const line of lines) {
    const existing = merged.get(line.variantId);
    merged.set(line.variantId, existing ? { ...existing, quantity: existing.quantity + line.quantity } : { ...line });
  }
  return [...merged.values()];
}
