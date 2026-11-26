import Image from "next/image";
import Link from "next/link";
import type { ShopCategoryNode } from "@/types/storefront/catalog";
import { getMessages } from "@/lib/i18n/server";
import { categoryHref } from "@/utils/storefront/nav";
import { BoltReveal } from "./bolt-reveal";
import { MoreCategoriesTile } from "./more-categories-tile";

/** The home page shows this many categories; the rest are picked on the shop page. */
const HOME_CATEGORY_LIMIT = 5;

/**
 * Root (and coming-soon) categories as photo tiles (the image set in the admin). A category
 * announced as coming soon says so and links to the coming-soon section.
 * Only the first five show; with more, the last tile sends shoppers to /shop.
 * Tiles below the fold unroll like bolts of cloth as they come into view.
 */
export async function CategoryTiles({ categories }: { categories: ShopCategoryNode[] }) {
  const { t } = await getMessages();
  if (categories.length === 0) return null;
  const shown = categories.slice(0, HOME_CATEGORY_LIMIT);
  const hidden = categories.length - shown.length;
  const columns = hidden > 0 ? "sm:grid-cols-3 lg:grid-cols-6" : "sm:grid-cols-3 lg:grid-cols-5";
  return (
    <section aria-label={t.home.categories} className="page-gutter">
      <BoltReveal>
        <ul className={`grid grid-cols-2 gap-[3px] ${columns}`}>
          {shown.map((category) => (
            <li key={category.id}>
              <Link
                data-bolt-tile
                href={categoryHref(category)}
                className="group relative block aspect-[3/4] overflow-hidden bg-selvedge/40"
              >
                <span data-bolt className="absolute inset-0 block">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 18vw, (min-width: 640px) 33vw, 50vw"
                      className={`object-cover transition-transform duration-700 ease-(--ease-quiet) group-hover:scale-[1.03] ${category.isComingSoon ? "grayscale-[35%]" : ""}`}
                    />
                  ) : null}
                  <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 bg-gradient-to-t from-ink/70 to-transparent p-4 pt-16 lg:p-6">
                    {category.isComingSoon ? <span className="type-label bg-chalk px-2 py-1 text-ink">{t.home.comingSoon}</span> : null}
                    <span className="type-h2 text-chalk">{category.name}</span>
                  </span>
                </span>
                <span
                  aria-hidden
                  data-bolt-roll
                  className="bolt-roll absolute inset-x-0 top-0 h-5 -translate-y-1/2 rounded-full opacity-0"
                />
              </Link>
            </li>
          ))}
          {hidden > 0 ? <MoreCategoriesTile count={hidden} t={t.home} /> : null}
        </ul>
      </BoltReveal>
    </section>
  );
}
