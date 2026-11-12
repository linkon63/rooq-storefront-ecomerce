"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { selectRecentlyViewed } from "@/lib/store/slices/product-lists-slice";
import { Price } from "../shared/price";
import { SectionHeading } from "../shared/section-heading";

/** "Recently viewed" from the Redux list (localStorage). Hidden until there is something to show. */
export function RecentlyViewedRail({ excludeId }: { excludeId?: string }) {
  const items = useAppSelector(selectRecentlyViewed).filter((item) => item.id !== excludeId);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="recently-viewed" className="page-gutter">
      <SectionHeading id="recently-viewed" title="Recently viewed" />
      <ul className="rail-scroll -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:px-0">
        {items.map((item) => (
          <li key={item.id} className="w-[34%] shrink-0 sm:w-[22%] lg:w-[14%]">
            <Link href={`/product/${item.slug}`} className="group flex flex-col gap-2">
              <span className="relative block aspect-[3/4] overflow-hidden bg-selvedge">
                {item.image ? <Image src={item.image} alt={item.name} fill sizes="(min-width: 1024px) 14vw, 34vw" className="object-cover" /> : null}
              </span>
              <span className="line-clamp-2 text-sm group-hover:underline">{item.name}</span>
              <Price price={item.price} compareAtPrice={item.compareAtPrice} className="text-sm" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
