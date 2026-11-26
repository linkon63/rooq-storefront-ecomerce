"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import type { NavItem } from "@/types/storefront/catalog";

export type NavLinkProps = { item: NavItem; soon?: string };
type NavLinkViewProps = NavLinkProps & { activeCategory: string | null };

/**
 * One desktop navigation link. A coming-soon category carries a "Soon" tag;
 * hovering or focusing it shows a tooltip, and the link opens the home
 * page's coming-soon section.
 */
export function NavLinkView({ item, soon = "Soon", activeCategory }: NavLinkViewProps) {
  const tipId = useId();
  const pathname = usePathname();
  const [path, query = ""] = item.href.split("?");
  const category = new URLSearchParams(query).get("category");
  const active = !item.soon && pathname === path && (category ? activeCategory === category : path !== "/shop" || !activeCategory);
  const tone = item.href === "/sale" ? "text-dye-deep" : active ? "text-dye font-bold" : "";
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      aria-describedby={item.soon ? tipId : undefined}
      title={item.label}
      className={`group relative type-label text-[0.9375rem]! inline-flex whitespace-nowrap items-center gap-1.5 py-2 transition-colors duration-200 hover:font-bold hover:text-dye ${tone}`}
    >
      <span data-label={item.label} className="inline-block max-w-[12rem] truncate after:invisible after:block after:h-0 after:font-bold after:content-[attr(data-label)]">
        {item.label}
      </span>
      {item.soon ? (
        <>
          <span className="bg-ink px-1.5 py-0.5 text-[0.5625rem] leading-none text-chalk">{soon}</span>
          <span
            id={tipId}
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full z-50 mt-1 w-max max-w-[14rem] -translate-x-1/2 bg-ink px-3 py-2 text-center type-meta normal-case tracking-normal text-chalk opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {item.label} is coming soon. See what is on the way.
          </span>
        </>
      ) : null}
    </Link>
  );
}
