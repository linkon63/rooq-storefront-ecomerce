"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiArrowLeft, FiMenu, FiSearch, FiShoppingBag } from "react-icons/fi";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectCartCount } from "@/lib/store/slices/cart-slice";
import { selectIsMobileNavOpen, setMobileNavOpen, setSearchOpen } from "@/lib/store/slices/ui-slice";
import { isTabRoot } from "@/utils/storefront/mobile-nav";
import Logo from "../shared/Logo";
import { CountBadge } from "../shell/count-badge";

const iconButton = "press relative grid size-11 shrink-0 place-items-center rounded-full";

/** Phone top bar: menu on the left, logo in the middle, search on the right; inner screens add back and bag. */
type Props = { accountTab: string | null; logo: string | null; menuLabel: string };

export function MobileAppBarView({ accountTab, logo, menuLabel }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const bag = useAppSelector(selectCartCount);
  const menuOpen = useAppSelector(selectIsMobileNavOpen);
  const hidden = useHideOnScroll();
  const root = isTabRoot(pathname, Boolean(accountTab));
  const back = () => (window.history.length > 1 ? router.back() : router.push("/"));

  return (
    <header
      className={`mobile-app-bar sticky top-0 z-40 border-b border-ink/10 bg-chalk transition-transform duration-300 md:hidden ${hidden ? "-translate-y-full" : ""}`}
    >
      <div className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 px-1.5">
        <div className="flex items-center">
          {root ? null : (
            <button type="button" onClick={back} aria-label="Back" className={iconButton}>
              <FiArrowLeft aria-hidden className="size-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => dispatch(setMobileNavOpen(true))}
            aria-label={menuLabel}
            aria-expanded={menuOpen}
            className={iconButton}
          >
            <FiMenu aria-hidden className="size-5" />
          </button>
        </div>
        <Link href="/" aria-label="Rooq home" className="shrink-0">
          <Logo kechi src={logo} className="h-9" />
        </Link>
        <div className="flex items-center justify-end">
          <button type="button" onClick={() => dispatch(setSearchOpen(true))} aria-label="Search" className={iconButton}>
            <FiSearch aria-hidden className="size-5" />
          </button>
          {root || pathname === "/checkout" ? null : (
            <Link href="/cart" aria-label={`Bag, ${bag} items`} className={iconButton}>
              <FiShoppingBag aria-hidden className="size-5" />
              <CountBadge count={bag} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
