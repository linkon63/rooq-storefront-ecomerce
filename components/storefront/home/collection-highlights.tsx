import Image from "next/image";
import Link from "next/link";
import { getMessages } from "@/lib/i18n/server";
import type { CollectionSummary, ProductCard as ProductCardData } from "@/types/storefront/catalog";
import { ProductCard } from "../product-card/product-card";
import { SectionHeading } from "../shared/section-heading";

export type CollectionHighlight = { collection: CollectionSummary; products: ProductCardData[] };

/** Each featured collection: its cover and story, beside its two most recent pieces. */
export async function CollectionHighlights({ items }: { items: CollectionHighlight[] }) {
  const { t } = await getMessages();
  const shown = items.filter((item) => item.products.length > 0);
  if (shown.length === 0) return null;
  return (
    <section aria-labelledby="collections-title" className="page-gutter flex flex-col gap-10">
      <SectionHeading id="collections-title" title={t.home.collections} link={{ label: t.home.allCollections, href: "/collections" }} />
      {shown.map(({ collection, products }) => (
        <article key={collection.id} className="grid gap-[3px] md:grid-cols-3">
          <Link href={`/collections/${collection.slug}`} className="group relative flex min-h-80 flex-col justify-end overflow-hidden bg-ink p-6 text-chalk">
            {collection.coverImageUrl ? (
              <Image src={collection.coverImageUrl} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover opacity-70" />
            ) : null}
            <span className="relative flex flex-col gap-3">
              <span className="type-label">{t.home.newestInEdit}</span>
              <span className="type-h2">{collection.name}</span>
              {collection.description ? <span className="type-body max-w-[36ch] text-chalk/85">{collection.description}</span> : null}
              <span className="type-label underline underline-offset-4">{t.home.shopCollection}</span>
            </span>
          </Link>
          {products.slice(0, 2).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </article>
      ))}
    </section>
  );
}
