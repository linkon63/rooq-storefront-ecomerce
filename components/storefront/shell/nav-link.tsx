import Link from "next/link";
import { useId } from "react";
import type { NavItem } from "@/types/storefront/catalog";

/**
 * One desktop navigation link. A coming-soon category carries a "Soon" tag;
 * hovering or focusing it shows a tooltip, and the link opens the home
 * page's coming-soon section.
 */
export function NavLink({ item }: { item: NavItem }) {
  const tipId = useId();
  const tone = item.label === "Sale" ? "text-dye-deep" : "";
  return (
    <Link
      href={item.href}
      aria-describedby={item.soon ? tipId : undefined}
      className={`group relative type-label inline-flex items-center gap-1.5 py-2 transition-opacity duration-300 ease-(--ease-quiet) hover:opacity-80 ${tone}`}
    >
      {item.label}
      {item.soon ? (
        <>
          <span className="bg-ink px-1.5 py-0.5 text-[0.5625rem] leading-none text-chalk">Soon</span>
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
