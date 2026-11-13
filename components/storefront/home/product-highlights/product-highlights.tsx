import { getProductById, productRail } from "@/lib/storefront/catalog-data";
import type { ProductCard } from "@/types/storefront/catalog";
import { SectionHeading } from "../../shared/section-heading";
import { HighlightCard } from "./highlight-card";

const HIGHLIGHT_COUNT = 2;

/**
 * Two pieces in the spotlight, after the best sellers: the products marked
 * Featured in the admin, else the top best sellers passed in. Each shows its
 * pictures beside its story, price and details.
 */
export async function ProductHighlights({ fallback }: { fallback: ProductCard[] }) {
  const featured = await productRail({ featured: true, sort: "popular", limit: HIGHLIGHT_COUNT });
  const cards = [...featured.data, ...fallback.filter((card) => !featured.data.some((f) => f.id === card.id))].slice(
    0,
    HIGHLIGHT_COUNT,
  );
  if (cards.length === 0) return null;
  const details = await Promise.all(cards.map((card) => getProductById(card.id)));
  return (
    <section aria-labelledby="highlights-title" className="page-gutter">
      <SectionHeading id="highlights-title" title="In the spotlight" />
      <div className="flex flex-col gap-[3px]">
        {cards.map((card, index) => (
          <HighlightCard key={card.id} card={card} detail={details[index]} reverse={index % 2 === 1} />
        ))}
      </div>
    </section>
  );
}
