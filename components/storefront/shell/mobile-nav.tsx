"use client";

import Link from "next/link";
import type { NavItem } from "@/types/storefront/catalog";
import type { Messages } from "@/lib/constants/storefront-copy";
import { MobileSignOut } from "./mobile-sign-out";
import { Modal } from "../shared/modal";

type MobileNavProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nav: NavItem[];
  t: Messages["mobileNav"];
};

/** Left sheet with the main views and account links; categories are picked on the shop page. */
export function MobileNav({ open, onOpenChange, nav, t }: MobileNavProps) {
  const close = () => onOpenChange(false);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t.menu} placement="left">
      <nav aria-label="Mobile" className="flex flex-col gap-8 px-4 py-6">
        <ul className="flex flex-col">
          {nav.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={close}
                className={`type-h2 block py-2.5 ${item.href === "/sale" ? "text-dye-deep" : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
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
