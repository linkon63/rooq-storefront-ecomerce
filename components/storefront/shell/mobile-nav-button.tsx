"use client";

import { FiMenu } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectIsMobileNavOpen, setMobileNavOpen } from "@/lib/store/slices/ui-slice";
import type { ShopCategoryNode } from "@/types/storefront/catalog";
import { MobileNav } from "./mobile-nav";

export function MobileNavButton({ categories }: { categories: ShopCategoryNode[] }) {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectIsMobileNavOpen);
  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => dispatch(setMobileNavOpen(true))}
        className="-ml-2 grid size-10 place-items-center rounded hover:bg-selvedge lg:hidden"
      >
        <FiMenu aria-hidden className="size-5" />
      </button>
      <MobileNav open={open} onOpenChange={(next) => dispatch(setMobileNavOpen(next))} categories={categories} />
    </>
  );
}
