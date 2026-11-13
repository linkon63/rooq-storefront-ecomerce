import Image from "next/image";
import { getMessages } from "@/lib/i18n/server";
import { COMING_SOON_ANCHOR } from "@/lib/constants/storefront";
import type { ProductCard as ProductCardData, ShopCategoryNode } from "@/types/storefront/catalog";
import { ProductCard } from "../product-card/product-card";
import { SectionHeading } from "../shared/section-heading";

type ComingSoonSectionProps = { categories: ShopCategoryNode[]; products: ProductCardData[] };

/**
 * What is on the way: categories announced as coming soon (set in the admin)
 * and products tagged "coming-soon". The header's "Soon" tags link here.
 */
export async function ComingSoonSection({ categories, products }: ComingSoonSectionProps) {
  const { t } = await getMessages();
  if (categories.length === 0 && products.length === 0) return null;
  return (
    <section id={COMING_SOON_ANCHOR} aria-labelledby="coming-soon-title" className="page-gutter scroll-mt-[calc(var(--header-h)+1.5rem)]">
      <SectionHeading id="coming-soon-title" title={t.home.comingSoon} />
      <p className="type-lead -mt-2 mb-6 max-w-[56ch] text-stone">{t.home.comingSoonLead}</p>
      {categories.length ? (
        <ul className="grid grid-cols-2 gap-[3px] md:grid-cols-3">
          {categories.map((category) => (
            <li key={category.id} className="relative aspect-[4/5] overflow-hidden bg-selvedge/40">
              {category.imageUrl ? (
                <Image src={category.imageUrl} alt="" fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover grayscale-[35%]" />
              ) : null}
              <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 bg-gradient-to-t from-ink/75 to-transparent p-4 pt-16">
                <span className="type-label bg-chalk px-2 py-1 text-ink">{t.home.comingSoon}</span>
                <span className="type-h2 text-chalk">{category.name}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {products.length ? (
        <ul className="mt-[3px] grid grid-cols-2 gap-[3px] lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
