/** Feature tiles per block of 24 products (slots 3 and 13), as on the Vaara grid. */
const BLOCK = 24;
const FEATURE_SLOTS: ReadonlySet<number> = new Set([2, 12]);

/** True when the product at `index` (position in the whole result) is a 2×2 tile. */
export function isFeatureTile(index: number): boolean {
  return FEATURE_SLOTS.has(index % BLOCK);
}
