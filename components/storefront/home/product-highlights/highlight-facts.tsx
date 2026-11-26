import type { Messages } from "@/lib/constants/storefront-copy";
import type { ProductDetail } from "@/types/storefront/catalog";

/** Material, colours, sizes and up to three features of a spotlight product. */
export function HighlightFacts({ detail, t }: { detail: ProductDetail; t: Messages["home"] }) {
  const facts = [
    { label: t.material, value: detail.material ?? detail.composition },
    { label: t.colours, value: detail.colors.map((color) => color.name).join(", ") || null },
    { label: t.sizes, value: detail.sizes.map((size) => size.label).join(", ") || null },
  ].filter((fact) => fact.value);
  const features = detail.features.slice(0, 3);
  if (facts.length === 0 && features.length === 0) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-gold/35 pt-4 text-sm">
      {facts.length ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5">
          {facts.map((fact) => (
            <div key={fact.label} className="contents">
              <dt className="type-label self-center text-stone">{fact.label}</dt>
              <dd className="font-medium text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {features.length ? (
        <ul className="flex flex-wrap gap-2 pt-0.5">
          {features.map((feature) => (
            <li key={feature} className="type-label border border-gold/45 bg-chalk/70 px-2.5 py-1 text-ink">
              {feature}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
