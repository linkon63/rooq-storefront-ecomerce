"use client";

import Link from "next/link";
import type { NavItem, ShopCategoryNode } from "@/types/storefront/catalog";
import { categoryHref } from "@/utils/storefront/nav";
import type { Messages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/locales";
import { LanguageSwitch } from "./language-switch";
import { MobileSignOut } from "./mobile-sign-out";
import { Modal } from "../shared/modal";

type MobileNavProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nav: NavItem[];
  categories: ShopCategoryNode[];
  t: Messages["mobileNav"];
  soon: string;
  locale: Locale;
  languageLabels: Messages["language"];
};

/** Left sheet with the main views and the top-level categories. */
export function MobileNav({ open, onOpenChange, nav, categories, t, soon, locale, languageLabels }: MobileNavProps) {
  const close = () => onOpenChange(false);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t.menu} placement="left">
      <nav aria-label="Mobile" className="flex flex-col gap-8 px-4 py-6">
        <LanguageSwitch locale={locale} labels={languageLabels} tone="light" />
        <ul className="flex flex-col">
          {nav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={close}
                className={`type-h2 block py-2.5 ${item.href === "/sale" ? "text-dye-deep" : ""}`}
              >
                {item.label}
                {item.soon ? <span className="type-label ml-2 bg-ink px-1.5 py-0.5 align-middle text-chalk">{soon}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
        {categories.length ? (
          <div>
            <p className="mb-2 text-sm text-stone">{t.byCategory}</p>
            <ul className="grid grid-cols-2 gap-x-4">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link href={categoryHref(category)} onClick={close} className="block py-2 text-[0.9375rem]">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <ul className="flex flex-col gap-1 border-t border-selvedge pt-6 text-[0.9375rem]">
          <li>
            <Link href="/profile" onClick={close} className="block py-2">
              {t.account}
            </Link>
          </li>
          <li>
            <Link href="/wishlist" onClick={close} className="block py-2">
              {t.wishlist}
            </Link>
          </li>
          <li>
            <Link href="/compare" onClick={close} className="block py-2">
              {t.compare}
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={close} className="block py-2">
              {t.contact}
            </Link>
          </li>
          <MobileSignOut label={t.signOut} onDone={close} />
        </ul>
      </nav>
    </Modal>
  );
}
