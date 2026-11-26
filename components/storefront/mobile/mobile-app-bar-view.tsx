"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiArrowLeft, FiSearch, FiShoppingBag } from "react-icons/fi";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";
import { ACCOUNT_TABS } from "@/lib/constants/storefront";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectCartCount } from "@/lib/store/slices/cart-slice";
import { setSearchOpen } from "@/lib/store/slices/ui-slice";
import { appBarTitle, isTabRoot } from "@/utils/storefront/mobile-nav";
import Logo from "../shared/Logo";
import { CountBadge } from "../shell/count-badge";

const iconButton = "press relative grid size-11 shrink-0 place-items-center rounded-full";

/** Phone top bar: logo and search on a tab's first screen, back and title inside. */
export function MobileAppBarView({ accountTab }: { accountTab: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const bag = useAppSelector(selectCartCount);
  const hidden = useHideOnScroll();
  const root = isTabRoot(pathname, Boolean(accountTab));
  const tabLabel = pathname === "/profile" ? ACCOUNT_TABS.find((tab) => tab.key === accountTab)?.label : undefined;
  const search = () => dispatch(setSearchOpen(true));
  const back = () => (window.history.length > 1 ? router.back() : router.push("/"));

  return (
    <header
      className={`mobile-app-bar sticky top-0 z-40 border-b border-ink/10 bg-chalk transition-transform duration-300 md:hidden ${hidden ? "-translate-y-full" : ""}`}
    >
      {root ? (
        <div className="flex h-14 items-center gap-3 px-4">
          <Link href="/" aria-label="Rooq home" className="shrink-0">
            <Logo kechi className="h-9" />
          </Link>
          <button type="button" onClick={search} className="press flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-paper px-4 text-sm text-stone">
            <FiSearch aria-hidden className="size-4 shrink-0" />
            <span className="truncate">Search sarees, shirts…</span>
          </button>
        </div>
      ) : (
        <div className="flex h-14 items-center gap-1 px-1.5">
          <button type="button" onClick={back} aria-label="Back" className={iconButton}>
            <FiArrowLeft aria-hidden className="size-5" />
          </button>
          <p className="min-w-0 flex-1 truncate text-base font-semibold">{tabLabel ?? appBarTitle(pathname)}</p>
          <button type="button" onClick={search} aria-label="Search" className={iconButton}>
            <FiSearch aria-hidden className="size-5" />
          </button>
          {pathname === "/checkout" ? null : (
            <Link href="/cart" aria-label={`Bag, ${bag} items`} className={iconButton}>
              <FiShoppingBag aria-hidden className="size-5" />
              <CountBadge count={bag} />
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
