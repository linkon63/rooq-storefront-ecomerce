import { getMessages } from "@/lib/i18n/server";
import { getProductById, productRail } from "@/lib/storefront/catalog-data";
import { SPOTLIGHT_INTERVAL_MS } from "@/lib/constants/storefront";
import type { ProductCard } from "@/types/storefront/catalog";
import { HighlightCard } from "./highlight-card";
import { SpotlightCarousel } from "./spotlight-carousel";

const HIGHLIGHT_COUNT = 2;

/**
 * Two pieces in the spotlight, after the best sellers: the products marked
 * Featured in the admin, else the top best sellers passed in. Each shows its
 * pictures beside its story, price and details, one per slide.
 */
export async function ProductHighlights({ fallback }: { fallback: ProductCard[] }) {
  const { t } = await getMessages();
  const featured = await productRail({ featured: true, sort: "popular", limit: HIGHLIGHT_COUNT });
  const cards = [...featured.data, ...fallback.filter((card) => !featured.data.some((f) => f.id === card.id))].slice(
    0,
    HIGHLIGHT_COUNT,
  );
  if (cards.length === 0) return null;
  const details = await Promise.all(cards.map((card) => getProductById(card.id)));
  return (
    <section aria-labelledby="highlights-title" className="page-gutter relative">
      <SpotlightCarousel
        titleId="highlights-title"
        title={t.home.spotlight}
        previousLabel={t.home.previousSlide}
        nextLabel={t.home.nextSlide}
        interval={SPOTLIGHT_INTERVAL_MS}
      >
        {cards.map((card, index) => (
          <HighlightCard
            key={card.id}
            card={card}
            detail={details[index]}
            index={index}
            reverse={index % 2 === 1}
            t={t.home}
          />
        ))}
      </SpotlightCarousel>
    </section>
  );
}
