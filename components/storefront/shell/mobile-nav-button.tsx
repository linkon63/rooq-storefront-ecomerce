"use client";

import { FiMenu } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectIsMobileNavOpen, setMobileNavOpen } from "@/lib/store/slices/ui-slice";
import type { Messages } from "@/lib/i18n/messages";
import type { NavItem, ShopCategoryNode } from "@/types/storefront/catalog";
import { MobileNav } from "./mobile-nav";

import type { Locale } from "@/lib/i18n/locales";

type Props = { locale: Locale; languageLabels: Messages["language"]; nav: NavItem[]; categories: ShopCategoryNode[]; t: Messages["mobileNav"]; openLabel: string; soon: string };

export function MobileNavButton({ nav, categories, t, openLabel, soon, locale, languageLabels }: Props) {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectIsMobileNavOpen);
  return (
    <>
      <button
        type="button"
        aria-label={openLabel}
        aria-expanded={open}
        onClick={() => dispatch(setMobileNavOpen(true))}
        className="-ml-2 grid size-10 place-items-center rounded hover:bg-selvedge lg:hidden"
      >
        <FiMenu aria-hidden className="size-5" />
      </button>
      <MobileNav open={open} onOpenChange={(next) => dispatch(setMobileNavOpen(next))} nav={nav} categories={categories} t={t} soon={soon} locale={locale} languageLabels={languageLabels} />
    </>
  );
}
