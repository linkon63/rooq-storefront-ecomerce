import Image from "next/image";
import Link from "next/link";
import type { ShopCategoryNode } from "@/types/storefront/catalog";
import { categoryHref } from "@/utils/storefront/nav";

export function CategoryTile({ category }: { category: ShopCategoryNode }) {
  return (
    <Link href={categoryHref(category)} className="press flex flex-col gap-1.5">
      <span className="relative aspect-square overflow-hidden rounded bg-selvedge">
        {category.imageUrl ? <Image src={category.imageUrl} alt="" fill sizes="(min-width: 768px) 20vw, 36vw" className="object-cover" /> : null}
      </span>
      <span className="text-sm">
        {category.name}
        {category.isComingSoon ? <span className="text-stone"> (soon)</span> : null}
      </span>
    </Link>
  );
}
