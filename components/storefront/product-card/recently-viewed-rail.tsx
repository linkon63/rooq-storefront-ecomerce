"use client";

import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { SectionHeading } from "../shared/section-heading";
import { ProductCard } from "./product-card";

/**
 * "Recently viewed": the shopper's stored list, refreshed from the API so
 * every card shows today's price, stock and sale. Hidden until there is something to show.
 */
export function RecentlyViewedRail({ excludeId }: { excludeId?: string }) {
  const { cards } = useRecentlyViewed(excludeId);
  if (cards.length === 0) return null;
  return (
    <section aria-labelledby="recently-viewed" className="page-gutter">
      <SectionHeading id="recently-viewed" title="Recently viewed" />
      <ul className="rail-scroll -mx-4 flex gap-3 overflow-x-auto px-4 md:-mx-6 md:gap-5 md:px-6 xl:mx-0 xl:px-0">
        {cards.map((card) => (
          <li key={card.id} className="w-[44%] shrink-0 sm:w-[30%] lg:w-[22%] xl:w-[18.5%]">
            <ProductCard product={card} />
          </li>
        ))}
      </ul>
    </section>
  );
}
