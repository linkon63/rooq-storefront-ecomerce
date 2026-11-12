import Link from "next/link";
import { PRIMARY_NAV } from "@/lib/constants/storefront";
import type { ShopCategoryNode } from "@/types/storefront/catalog";
import Logo from "../shared/Logo";
import { HeaderActions } from "./header-actions";
import { MobileNavButton } from "./mobile-nav-button";

type SiteHeaderProps = {
  categories: ShopCategoryNode[];
  announcement: string | null;
};

/** Sticky header: thin, left-aligned, the garment gets the space. */
export function SiteHeader({ categories, announcement }: SiteHeaderProps) {
  const topCategories = categories.filter((category) => !category.parentId && category.isActive !== false).slice(0, 8);
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded bg-ink px-4 py-2 text-chalk focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      {announcement ? (
        <p className="bg-ink px-4 py-2 text-center text-xs font-medium text-chalk">{announcement}</p>
      ) : null}
      <header className="sticky top-0 z-40 border-b border-selvedge bg-chalk/90 backdrop-blur-md">
        <div className="page-gutter flex h-14 items-center gap-3 md:h-16 md:gap-6">
          <MobileNavButton categories={topCategories} />
          <Link href="/" aria-label="Rooq home" className="shrink-0">
            <Logo className="h-6 md:h-7" />
          </Link>
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {PRIMARY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`rounded px-3 py-2 text-sm font-medium hover:bg-selvedge ${item.label === "Sale" ? "text-dye-deep" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <HeaderActions />
        </div>
      </header>
    </>
  );
}
