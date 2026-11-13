import Link from "next/link";
import type { NavItem, ShopCategoryNode } from "@/types/storefront/catalog";
import Logo from "../shared/Logo";
import { HeaderActions } from "./header-actions";
import { MobileNavButton } from "./mobile-nav-button";
import { NavLink } from "./nav-link";

type SiteHeaderProps = {
  nav: NavItem[];
  categories: ShopCategoryNode[];
  announcement: string | null;
};

/** Sticky header: thin, left-aligned, the garment gets the space. */
export function SiteHeader({ nav, categories, announcement }: SiteHeaderProps) {
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
        <p className="type-label flex h-8 items-center justify-center bg-ink px-4 text-center text-chalk">{announcement}</p>
      ) : null}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-chalk/90 backdrop-blur-md">
        <div className="page-gutter flex h-14 items-center gap-3 lg:h-[4.5rem] lg:gap-8">
          <MobileNavButton nav={nav} categories={topCategories} />
          <Link href="/" aria-label="Rooq home" className="shrink-0">
            <Logo className="h-8 lg:h-10" />
          </Link>
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {nav.map((item) => (
                <li key={item.label}>
                  <NavLink item={item} />
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
