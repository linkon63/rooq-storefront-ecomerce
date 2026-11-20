"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";
import { FiHeart, FiSearch, FiShoppingBag, FiStar, FiUser } from "react-icons/fi";
import { LuGitCompareArrows } from "react-icons/lu";
import { useSession } from "@/hooks/use-session";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectCartCount } from "@/lib/store/slices/cart-slice";
import { selectCompareCount, selectWishlistCount } from "@/lib/store/slices/product-lists-slice";
import { setCartDrawerOpen, setSearchOpen } from "@/lib/store/slices/ui-slice";
import { onWishlistFlyLand, onWishlistFlyStart } from "@/lib/storefront/wishlist-fly";
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
  const [inFlightCount, setInFlightCount] = useState(0);
  const wishlistHeartRef = useRef<HTMLSpanElement>(null);
  const wishlistBadgeWrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const offStart = onWishlistFlyStart(() => {
      setInFlightCount((c) => c + 1);
    });
    const offLand = onWishlistFlyLand(() => {
      setInFlightCount((c) => Math.max(0, c - 1));
      if (wishlistHeartRef.current) {
        gsap.killTweensOf(wishlistHeartRef.current);
        gsap.fromTo(
          wishlistHeartRef.current,
          { scale: 1, color: "var(--color-dye)" },
          {
            scale: 1.38,
            duration: 0.16,
            ease: "back.out(3)",
            yoyo: true,
            repeat: 1,
            clearProps: "transform,color",
          },
        );
      }
      requestAnimationFrame(() => {
        if (wishlistBadgeWrapRef.current) {
          gsap.killTweensOf(wishlistBadgeWrapRef.current);
          gsap.fromTo(
            wishlistBadgeWrapRef.current,
            { scale: 0.65 },
            { scale: 1, duration: 0.3, ease: "back.out(2.5)", clearProps: "transform" },
          );
        }
      });
    });
    return () => {
      offStart();
      offLand();
    };
  }, []);

  const displayedWishlistCount = Math.max(0, wishlistCount - inFlightCount);

  return (
    <div className="ml-auto flex items-center gap-0.5">
      <button type="button" className={iconButton} aria-label={t.search} onClick={() => dispatch(setSearchOpen(true))}>
        <FiSearch aria-hidden className="size-5" />
      </button>
      <Link href="/customer-gallery" className={iconButton} aria-label={t.reviews} title={t.reviews}>
        <FiStar aria-hidden className="size-5" />
      </Link>
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
      <Link
        href="/wishlist"
        data-wishlist-target
        className={`${iconButton} hidden sm:grid`}
        aria-label={`Wishlist, ${wishlistCount} items`}
      >
        <span ref={wishlistHeartRef} className="inline-flex">
          <FiHeart aria-hidden className="size-5" />
        </span>
        <CountBadge count={displayedWishlistCount} badgeRef={wishlistBadgeWrapRef} />
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
