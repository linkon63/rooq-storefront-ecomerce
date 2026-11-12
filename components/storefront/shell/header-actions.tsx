"use client";

import Link from "next/link";
import { FiHeart, FiSearch, FiShoppingBag, FiUser } from "react-icons/fi";
import { useSession } from "@/hooks/use-session";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectCartCount } from "@/lib/store/slices/cart-slice";
import { selectWishlistCount } from "@/lib/store/slices/product-lists-slice";
import { setCartDrawerOpen, setSearchOpen } from "@/lib/store/slices/ui-slice";
import { CountBadge } from "./count-badge";

const iconButton = "relative grid size-10 place-items-center rounded hover:bg-selvedge";

/** Search, account, wishlist and bag. Counts come from Redux. */
export function HeaderActions() {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const { isSignedIn, openAuth } = useSession();

  return (
    <div className="ml-auto flex items-center gap-0.5">
      <button type="button" className={iconButton} aria-label="Search" onClick={() => dispatch(setSearchOpen(true))}>
        <FiSearch aria-hidden className="size-5" />
      </button>
      {isSignedIn ? (
        <Link href="/profile" className={iconButton} aria-label="Your account">
          <FiUser aria-hidden className="size-5" />
        </Link>
      ) : (
        <button type="button" className={iconButton} aria-label="Sign in" onClick={() => openAuth("login")}>
          <FiUser aria-hidden className="size-5" />
        </button>
      )}
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
