import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages";
import type { NavItem, ShopCategoryNode } from "@/types/storefront/catalog";
import Logo from "../shared/Logo";
import { HeaderActions } from "./header-actions";
import { MobileNavButton } from "./mobile-nav-button";
import { Suspense } from "react";
import { NavLink } from "./nav-link";
import { TopBar } from "./top-bar";

type SiteHeaderProps = {
  nav: NavItem[];
  categories: ShopCategoryNode[];
  announcement: string | null;
  phone: string | null;
  whatsapp: string;
  locale: Locale;
  t: Messages;
};

/** Sticky header: thin, left-aligned, the garment gets the space. */
export function SiteHeader({ nav: allNav, categories, announcement, phone, whatsapp, locale, t }: SiteHeaderProps) {
  // Coming-soon categories stay out of the header (they remain in the footer and on the home page).
  const nav = allNav.filter((item) => !item.soon);
  const topCategories = categories
    .filter((category) => !category.parentId && category.isActive !== false && !category.isComingSoon)
    .slice(0, 8);
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded bg-ink px-4 py-2 text-chalk focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t.header.skip}
      </a>
      <TopBar phone={phone} whatsapp={whatsapp} announcement={announcement} locale={locale} t={t} />
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-chalk/90 backdrop-blur-md">
        <div className="page-gutter grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center gap-3 lg:h-24 lg:gap-8">
          <div className="flex items-center">
            <MobileNavButton nav={nav} categories={topCategories} t={t.mobileNav} openLabel={t.header.openMenu} soon={t.nav.soon} />
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-6">
                <Suspense fallback={null}>
                  {nav.map((item) => (
                    <li key={item.label}>
                      <NavLink item={item} soon={t.nav.soon} />
                    </li>
                  ))}
                </Suspense>
              </ul>
            </nav>
          </div>
          <Link href="/" aria-label={t.header.home} className="shrink-0" data-stitch-origin>
            <Logo kechi className="h-14 lg:h-[4.5rem]" />
          </Link>
          <HeaderActions t={t.header} />
        </div>
      </header>
    </>
  );
}
