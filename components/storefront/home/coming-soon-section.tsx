import { getMessages } from "@/lib/i18n/server";
import { COMING_SOON_ANCHOR } from "@/lib/constants/storefront";
import type { ProductCard as ProductCardData, ShopCategoryNode } from "@/types/storefront/catalog";
import { ComingSoonTile, type ComingSoonItem } from "./coming-soon-tile";

type ComingSoonSectionProps = { categories: ShopCategoryNode[]; products: ProductCardData[] };

/** Small cards beside the text card. */
const TILE_COUNT = 3;

/**
 * What is on the way: one card carries the section's words, then three small
 * cards — categories announced as coming soon (admin), topped up with products
 * tagged "coming-soon". The header's "Soon" tags link here.
 */
export async function ComingSoonSection({ categories, products }: ComingSoonSectionProps) {
  const { t } = await getMessages();
  const items: ComingSoonItem[] = [
    ...categories.map((c) => ({ id: c.id, name: c.name, imageUrl: c.imageUrl ?? null, href: null })),
    ...products.map((p) => ({ id: p.id, name: p.name, imageUrl: p.image?.url ?? null, href: `/product/${p.slug}` })),
  ].slice(0, TILE_COUNT);
  if (items.length === 0) return null;

  return (
    <section id={COMING_SOON_ANCHOR} aria-labelledby="coming-soon-title" className="page-gutter scroll-mt-[calc(var(--header-h)+1.5rem)]">
      <ul className="grid grid-cols-3 gap-2 lg:grid-cols-4 lg:gap-4">
        <li className="col-span-3 flex flex-col justify-center gap-3 bg-ink p-5 text-chalk sm:p-7 lg:col-span-1">
          <h2 id="coming-soon-title" className="type-h2">
            {t.home.comingSoon}
          </h2>
          <p className="max-w-[40ch] text-sm leading-relaxed text-chalk/80">{t.home.comingSoonLead}</p>
        </li>
        {items.map((item) => (
          <li key={item.id}>
            <ComingSoonTile item={item} soon={t.home.comingSoon} />
          </li>
        ))}
      </ul>
    </section>
  );
}
