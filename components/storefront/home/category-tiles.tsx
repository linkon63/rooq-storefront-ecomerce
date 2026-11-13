import Image from "next/image";
import Link from "next/link";
import type { ShopCategoryNode } from "@/types/storefront/catalog";
import { categoryHref } from "@/utils/storefront/nav";
import { MoreCategoriesTile } from "./more-categories-tile";

/** The home page shows this many categories; the rest are picked on the shop page. */
const HOME_CATEGORY_LIMIT = 5;

/**
 * Root categories as photo tiles (the image set in the admin). A category
 * announced as coming soon says so and links to the coming-soon section.
 * Only the first five show; with more, the last tile sends shoppers to /shop.
 */
export function CategoryTiles({ categories }: { categories: ShopCategoryNode[] }) {
  if (categories.length === 0) return null;
  const shown = categories.slice(0, HOME_CATEGORY_LIMIT);
  const hidden = categories.length - shown.length;
  const columns = hidden > 0 ? "sm:grid-cols-3 lg:grid-cols-6" : "sm:grid-cols-3 lg:grid-cols-5";
  return (
    <section aria-label="Shop by category" className="page-gutter">
      <ul className={`grid grid-cols-2 gap-[3px] ${columns}`}>
        {shown.map((category) => (
          <li key={category.id}>
            <Link href={categoryHref(category)} className="group relative block aspect-[3/4] overflow-hidden bg-selvedge/40">
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
                {category.isComingSoon ? <span className="type-label bg-chalk px-2 py-1 text-ink">Coming soon</span> : null}
                <span className="type-h2 text-chalk">{category.name}</span>
              </span>
            </Link>
          </li>
        ))}
        {hidden > 0 ? <MoreCategoriesTile count={hidden} /> : null}
      </ul>
    </section>
  );
}
