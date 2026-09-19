import type { Product } from "./admin-api";

export type Variant = NonNullable<Product["variants"]>[number];

/** "Weight" → ["200 g", "500 g"], preserving the order variants were created in. */
export function buildAttributeGroups(product: Product) {
  const groups = new Map<string, string[]>();
  for (const variant of product.variants ?? []) {
    for (const attribute of variant.attributes ?? []) {
      const name = attribute.attributeValue?.attribute?.name;
      const value = attribute.attributeValue?.value;
      if (!name || !value) continue;
      const values = groups.get(name) ?? [];
      if (!values.includes(value)) values.push(value);
      groups.set(name, values);
    }
  }
  return [...groups.entries()].map(([name, values]) => ({ name, values }));
}

/** A variant's attributes as { "Weight": "500 g", … }. */
export function variantValues(variant: Variant) {
  const map: Record<string, string> = {};
  for (const attribute of variant.attributes ?? []) {
    const name = attribute.attributeValue?.attribute?.name;
    const value = attribute.attributeValue?.value;
    if (name && value) map[name] = value;
  }
  return map;
}

export function defaultVariantOf(product: Product): Variant | undefined {
  return product.variants?.find((variant) => variant.isDefault) ?? product.variants?.[0];
}
