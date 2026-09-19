import type { CartItem } from "./types";

/**
 * The variant a cart line holds, as label/value pairs — [{ "Weight", "500 g" }].
 * Lines saved before attributes were stored only carry the joined `size`
 * string, which is shown under a generic "Variant" label.
 */
export function variantParts(item: CartItem): { label: string; value: string }[] {
  const attributes = Object.entries(item.attributes ?? {}).filter(([, value]) => value);
  if (attributes.length > 0) return attributes.map(([label, value]) => ({ label, value }));
  return item.size ? [{ label: "Variant", value: item.size }] : [];
}

/** "Weight: 500 g · Color: Red" — for one-line summaries. */
export function variantText(item: CartItem): string {
  return variantParts(item)
    .map(({ label, value }) => `${label}: ${value}`)
    .join(" · ");
}
