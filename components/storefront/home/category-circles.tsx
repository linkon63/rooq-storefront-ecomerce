import Image from "next/image";
import Link from "next/link";
import type { ShopCategoryNode } from "@/types/storefront/catalog";
import { categoryHref } from "@/utils/storefront/nav";

/** Phones: a swipeable row of round category shortcuts at the top of home. */
export function CategoryCircles({ categories }: { categories: ShopCategoryNode[] }) {
  if (categories.length === 0) return null;
  return (
    <nav aria-label="Categories" className="-mb-5 pt-3 md:hidden">
      <ul className="rail-scroll flex gap-3 overflow-x-auto px-4">
        {categories.map((category) => (
          <li key={category.id} className="w-[4.5rem] shrink-0">
            <Link href={categoryHref(category)} className="press flex flex-col items-center gap-1.5">
              <span className="relative size-16 overflow-hidden rounded-full bg-selvedge ring-1 ring-line">
                {category.imageUrl ? (
                  <Image src={category.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <span aria-hidden className="absolute inset-0 grid place-items-center text-lg">
                    {category.name.charAt(0)}
                  </span>
                )}
              </span>
              <span className="line-clamp-1 text-center text-xs">{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
