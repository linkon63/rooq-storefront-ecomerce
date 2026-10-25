import type { Product } from "./admin-api";

export type Variant = NonNullable<Product["variants"]>[number];

export type VariantOptionPair = {
  attributeId?: string;
  attributeName: string;
  valueId?: string;
  value: string;
};

/**
 * A variant's option values as { attribute, value } pairs. The API returns them
 * under `attributes` (with ids); `optionValues` is kept as a fallback for the
 * lighter payloads that only carry names.
 */
export function variantOptionPairs(variant: Variant): VariantOptionPair[] {
  const pairs = (variant.attributes ?? []).flatMap((attribute) => {
    const attributeValue = attribute.attributeValue;
    if (!attributeValue?.value || !attributeValue.attribute?.name) return [];
    return [
      {
        attributeId: attributeValue.attribute.id,
        attributeName: attributeValue.attribute.name,
        valueId: attributeValue.id,
        value: attributeValue.value,
      },
    ];
  });
  if (pairs.length > 0) return pairs;

  return (variant.optionValues ?? []).map((optionValue) => ({
    attributeName: optionValue.attribute.name,
    value: optionValue.value,
  }));
}

/** ["Weight: 500 g", "Colour: Red"] — one entry per option, for the invoice lines. */
export function variantOptionLines(variant: Variant): string[] {
  return variantOptionPairs(variant).map((pair) => `${pair.attributeName}: ${pair.value}`);
}

/** "Weight: 500 g · Colour: Red", or an empty string for a variant with no options. */
export function variantOptionLabel(variant: Variant) {
  return variantOptionPairs(variant)
    .map((pair) => `${pair.attributeName}: ${pair.value}`)
    .join(" · ");
}

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
