"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectIsMobileNavOpen, setMobileNavOpen } from "@/lib/store/slices/ui-slice";
import type { Messages } from "@/lib/constants/storefront-copy";
import type { NavItem } from "@/types/storefront/catalog";

/* The menu sheet loads the first time it is opened. */
const MobileNav = dynamic(() => import("./mobile-nav").then((m) => m.MobileNav), { ssr: false });

type Props = { nav: NavItem[]; t: Messages["mobileNav"] };

/** The one menu sheet, opened by the phone app bar or the tablet header button. */
export function MobileNavSheet({ nav, t }: Props) {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectIsMobileNavOpen);
  const [opened, setOpened] = useState(false);
  if (open && !opened) setOpened(true);
  return opened ? <MobileNav open={open} onOpenChange={(next) => dispatch(setMobileNavOpen(next))} nav={nav} t={t} /> : null;
}
