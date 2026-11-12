import { FIT_LABELS, OCCASION_LABELS, PATTERN_LABELS, SEASON_LABELS } from "@/lib/constants/catalog";
import type { ProductDetail } from "@/types/storefront/catalog";

export type Row = { label: string; value: string };

/** Label/value facts for the "Fabric and fit" panel, skipping empty fields. */
export function factRows(product: ProductDetail): Row[] {
  const rows: (Row | null)[] = [
    product.fit ? { label: "Fit", value: FIT_LABELS[product.fit] } : null,
    product.material ? { label: "Material", value: product.material } : null,
    product.composition ? { label: "Composition", value: product.composition } : null,
    product.pattern ? { label: "Pattern", value: PATTERN_LABELS[product.pattern] } : null,
    product.season ? { label: "Season", value: SEASON_LABELS[product.season] } : null,
    product.occasions.length ? { label: "Wear it for", value: product.occasions.map((o) => OCCASION_LABELS[o]).join(", ") } : null,
    product.styleCode ? { label: "Style code", value: product.styleCode } : null,
    ...product.attributes.map((entry) => ({ label: entry.attribute, value: entry.value })),
  ];
  return rows.filter((row): row is Row => row !== null);
}
