import { DEFAULT_SKU_PATTERN } from "@/lib/constants/catalog";

const SKU_UNSAFE = /[^A-Z0-9-]+/g;
const DASH_RUNS = /-{2,}/g;
const EDGE_DASHES = /^-+|-+$/g;

export type SkuParts = { styleCode: string | null; productSlug: string; colorSlug: string; sizeLabel: string };

/** `{style}` = style code or upper-case slug. */
export function skuStyleToken(styleCode: string | null, productSlug: string): string {
  return (styleCode?.trim() || productSlug).toUpperCase();
}

/** `{color}` = first three letters of the colour slug, upper case. */
export function skuColorToken(colorSlug: string): string {
  return colorSlug.replace(/-/g, "").slice(0, 3).toUpperCase();
}

/** `{size}` = size label upper case, spaces removed. */
export function skuSizeToken(sizeLabel: string): string {
  return sizeLabel.replace(/\s+/g, "").toUpperCase();
}

/** "{style}-{color}-{size}" → "RQ-TS-001-BLA-M". */
export function buildSku(parts: SkuParts, pattern: string = DEFAULT_SKU_PATTERN): string {
  return pattern
    .replaceAll("{style}", skuStyleToken(parts.styleCode, parts.productSlug))
    .replaceAll("{color}", skuColorToken(parts.colorSlug))
    .replaceAll("{size}", skuSizeToken(parts.sizeLabel))
    .toUpperCase()
    .replace(SKU_UNSAFE, "-")
    .replace(DASH_RUNS, "-")
    .replace(EDGE_DASHES, "");
}

/** "SKU", "SKU-2", "SKU-3"… — first candidate not in `taken`. */
export function uniqueSku(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
