"use client";

import Link from "next/link";
import type { NavItem, ShopCategoryNode } from "@/types/storefront/catalog";
import { categoryHref } from "@/utils/storefront/nav";
import { Modal } from "../shared/modal";

type MobileNavProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nav: NavItem[];
  categories: ShopCategoryNode[];
};

/** Left sheet with the main views and the top-level categories. */
export function MobileNav({ open, onOpenChange, nav, categories }: MobileNavProps) {
  const close = () => onOpenChange(false);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Menu" placement="left">
      <nav aria-label="Mobile" className="flex flex-col gap-8 px-4 py-6">
        <ul className="flex flex-col">
          {nav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={close}
                className={`type-h2 block py-2.5 ${item.label === "Sale" ? "text-dye-deep" : ""}`}
              >
                {item.label}
                {item.soon ? <span className="type-label ml-2 bg-ink px-1.5 py-0.5 align-middle text-chalk">Soon</span> : null}
              </Link>
            </li>
          ))}
        </ul>
        {categories.length ? (
          <div>
            <p className="mb-2 text-sm text-stone">Shop by category</p>
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
              Account and orders
            </Link>
          </li>
          <li>
            <Link href="/wishlist" onClick={close} className="block py-2">
              Wishlist
            </Link>
          </li>
          <li>
            <Link href="/compare" onClick={close} className="block py-2">
              Compare
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={close} className="block py-2">
              Help and contact
            </Link>
          </li>
        </ul>
      </nav>
    </Modal>
  );
}
