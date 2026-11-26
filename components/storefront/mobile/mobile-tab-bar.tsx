"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import { FaBagShopping, FaHeart, FaHouse, FaTableCellsLarge, FaUser } from "react-icons/fa6";
import { FiGrid, FiHeart, FiHome, FiShoppingBag, FiUser } from "react-icons/fi";
import { useAppSelector } from "@/lib/store/hooks";
import { selectCartCount } from "@/lib/store/slices/cart-slice";
import { selectWishlistCount } from "@/lib/store/slices/product-lists-slice";
import { isTabBarHidden, MOBILE_TABS, type MobileTabKey } from "@/utils/storefront/mobile-nav";
import { CountBadge } from "../shell/count-badge";

const ICONS: Record<MobileTabKey, { idle: IconType; active: IconType }> = {
  home: { idle: FiHome, active: FaHouse },
  shop: { idle: FiGrid, active: FaTableCellsLarge },
  bag: { idle: FiShoppingBag, active: FaBagShopping },
  wishlist: { idle: FiHeart, active: FaHeart },
  me: { idle: FiUser, active: FaUser },
};

/** Phone bottom navigation. Tapping the open tab again scrolls to the top. */
export function MobileTabBar() {
  const pathname = usePathname();
  const bag = useAppSelector(selectCartCount);
  const wishlist = useAppSelector(selectWishlistCount);
  if (isTabBarHidden(pathname)) return null;
  const counts: Partial<Record<MobileTabKey, number>> = { bag, wishlist };

  return (
    <nav aria-label="App" data-tab-bar className="mobile-tab-bar fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper md:hidden">
      <ul className="grid h-14 grid-cols-5">
        {MOBILE_TABS.map((tab) => {
          const active = pathname === tab.href;
          const Icon = ICONS[tab.key][active ? "active" : "idle"];
          const count = counts[tab.key] ?? 0;
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                aria-label={count ? `${tab.label}, ${count} items` : undefined}
                data-wishlist-target={tab.key === "wishlist" ? "" : undefined}
                onClick={() => {
                  if (active) window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`press flex h-full flex-col items-center justify-center gap-0.5 text-[0.6875rem] ${active ? "font-semibold text-ink" : "text-stone"}`}
              >
                <span className="relative grid h-7 w-11 place-items-center">
                  <Icon aria-hidden className="size-5" />
                  <CountBadge count={count} />
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
