import type { ProductDetail } from "@/types/storefront/catalog";

/** Material, colours, sizes and up to three features of a spotlight product. */
export function HighlightFacts({ detail }: { detail: ProductDetail }) {
  const facts = [
    { label: "Material", value: detail.material ?? detail.composition },
    { label: "Colours", value: detail.colors.map((color) => color.name).join(", ") || null },
    { label: "Sizes", value: detail.sizes.map((size) => size.label).join(", ") || null },
  ].filter((fact) => fact.value);
  const features = detail.features.slice(0, 3);
  if (facts.length === 0 && features.length === 0) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4 text-sm">
      {facts.length ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
          {facts.map((fact) => (
            <div key={fact.label} className="contents">
              <dt className="text-stone">{fact.label}</dt>
              <dd className="font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {features.length ? (
        <ul className="flex flex-wrap gap-2">
          {features.map((feature) => (
            <li key={feature} className="type-label border border-line px-2 py-1">
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
