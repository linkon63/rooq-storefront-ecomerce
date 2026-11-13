import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages";
import type { NavItem, ShopCategoryNode } from "@/types/storefront/catalog";
import Logo from "../shared/Logo";
import { HeaderActions } from "./header-actions";
import { MobileNavButton } from "./mobile-nav-button";
import { Suspense } from "react";
import { NavLink } from "./nav-link";
import { StickyHeader } from "./sticky-header";
import { TopBar } from "./top-bar";
import { headerNav } from "@/utils/storefront/nav";

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
      <StickyHeader>
        <div className="page-gutter grid h-[calc(4.5rem-1rem*var(--p))] grid-cols-[1fr_auto_1fr] items-center gap-3 lg:h-[calc(6rem-2rem*var(--p))] lg:gap-8">
          <div className="flex items-center">
            <MobileNavButton nav={nav} categories={topCategories} locale={locale} languageLabels={t.language} t={t.mobileNav} openLabel={t.header.openMenu} soon={t.nav.soon} />
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-6">
                <Suspense fallback={null}>
                  {headerNav(nav).map((item) => (
                    <li key={item.label}>
                      <NavLink item={item} soon={t.nav.soon} />
                    </li>
                  ))}
                </Suspense>
              </ul>
            </nav>
          </div>
          <Link href="/" prefetch aria-label={t.header.home} className="shrink-0" data-stitch-origin>
            <Logo kechi className="h-[calc(3.5rem-1.25rem*var(--p))] lg:h-[calc(4.5rem-1.75rem*var(--p))]" />
          </Link>
          <HeaderActions t={t.header} />
        </div>
      </StickyHeader>
    </>
  );
}
