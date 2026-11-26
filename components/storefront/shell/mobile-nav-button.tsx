"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectIsMobileNavOpen, setMobileNavOpen } from "@/lib/store/slices/ui-slice";
import type { Messages } from "@/lib/constants/storefront-copy";
import type { NavItem, ShopCategoryNode } from "@/types/storefront/catalog";

/* The menu sheet loads the first time it is opened. */
const MobileNav = dynamic(() => import("./mobile-nav").then((m) => m.MobileNav), { ssr: false });


type Props = { nav: NavItem[]; categories: ShopCategoryNode[]; t: Messages["mobileNav"]; openLabel: string; soon: string };

export function MobileNavButton({ nav, categories, t, openLabel, soon }: Props) {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectIsMobileNavOpen);
  const [opened, setOpened] = useState(false);
  if (open && !opened) setOpened(true);
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
      {opened ? <MobileNav open={open} onOpenChange={(next) => dispatch(setMobileNavOpen(next))} nav={nav} categories={categories} t={t} soon={soon} /> : null}
    </>
  );
}
