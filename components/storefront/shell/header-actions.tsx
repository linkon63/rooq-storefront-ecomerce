"use client";

import Link from "next/link";
import { FiHeart, FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import { LuGitCompareArrows } from "react-icons/lu";
import { useSession } from "@/hooks/use-session";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectCartCount } from "@/lib/store/slices/cart-slice";
import { selectCompareCount, selectWishlistCount } from "@/lib/store/slices/product-lists-slice";
import { setCartDrawerOpen, setSearchOpen } from "@/lib/store/slices/ui-slice";
import type { Messages } from "@/lib/i18n/messages";
import { AccountMenu } from "./account-menu";
import { CountBadge } from "./count-badge";

const iconButton = "relative grid size-10 place-items-center rounded hover:bg-selvedge";

/** Search, account, compare, wishlist and bag. Counts come from Redux. */
export function HeaderActions({ t }: { t: Messages["header"] }) {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const compareCount = useAppSelector(selectCompareCount);
  const { isSignedIn, openAuth } = useSession();

  return (
    <div className="ml-auto flex items-center gap-0.5">
      <button type="button" className={iconButton} aria-label={t.search} onClick={() => dispatch(setSearchOpen(true))}>
        <FiSearch aria-hidden className="size-5" />
      </button>
      {isSignedIn ? (
        <AccountMenu t={t} buttonClassName={iconButton} />
      ) : (
        <button type="button" className={iconButton} aria-label={t.signIn} onClick={() => openAuth("login")}>
          <FiUser aria-hidden className="size-5" />
        </button>
      )}
      <Link href="/compare" className={`${iconButton} hidden sm:grid`} aria-label={`${t.compare}, ${compareCount} items`} title={t.compare}>
        <LuGitCompareArrows aria-hidden className="size-5" />
        <CountBadge count={compareCount} />
      </Link>
      <Link href="/wishlist" className={`${iconButton} hidden sm:grid`} aria-label={`Wishlist, ${wishlistCount} items`}>
        <FiHeart aria-hidden className="size-5" />
        <CountBadge count={wishlistCount} />
      </Link>
      <button
        type="button"
        className={iconButton}
        aria-label={`Bag, ${cartCount} items`}
        onClick={() => dispatch(setCartDrawerOpen(true))}
      >
        <FiShoppingBag aria-hidden className="size-5" />
        <CountBadge count={cartCount} />
      </button>
    </div>
  );
}
