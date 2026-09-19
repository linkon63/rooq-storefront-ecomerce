"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { FiClock, FiUser, FiMenu, FiX, FiSearch } from "react-icons/fi";
import { HiOutlineShoppingCart, HiOutlineHeart } from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";

import Logo from "./Logo";
import SearchField from "./SearchField";
import type { ShopCategory, ShopSettings } from "@/lib/shop-api";
import { BLOG_ENABLED } from "@/lib/feature-flags";
import { resolveShopContact, telHref, whatsappHref } from "@/lib/shop-contact";
import { useAuth } from "@/app/_providers/auth-provider";
import { useCart } from "@/app/_providers/cart-provider";
import { useWishlist } from "@/app/_providers/wishlist-provider";

interface HeaderProps {
  settings?: ShopSettings | null;
  categories?: ShopCategory[];
}

/** How many top-level categories get their own slot in the nav. */
const NAV_CATEGORY_COUNT = 2;

const LEADING_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  ...(BLOG_ENABLED ? [{ label: "Blog", href: "/blog" }] : []),
];

const TRAILING_LINKS = [
  { label: "Offers", href: "/shop?discounted=1" },
  { label: "Contact", href: "/contact" },
];

interface NavLink {
  label: string;
  href: string;
}

/**
 * How well a nav link describes the current URL, or 0 when it does not describe
 * it at all. The nav mixes plain paths ("/shop") with filtered ones
 * ("/shop?category=Honey"), and on `/shop?category=Honey` both of those match —
 * the score breaks the tie so the more specific link is the one that lights up.
 */
function matchScore(href: string, pathname: string, params: URLSearchParams | null): number {
  const [path, query = ""] = href.split("?");

  // Home has to match exactly; every other path also owns its sub-pages, so
  // /blog stays lit on /blog/some-post.
  const pathMatches = path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);
  if (!pathMatches) return 0;

  const required = [...new URLSearchParams(query)];
  if (required.some(([key, value]) => params?.get(key) !== value)) return 0;

  return required.length + 1;
}

/** The href of the single link that owns the current URL, or "" for none. */
function activeHrefFor(links: NavLink[], pathname: string, params: URLSearchParams | null): string {
  let best = "";
  let bestScore = 0;

  for (const link of links) {
    const score = matchScore(link.href, pathname, params);
    if (score > bestScore) {
      best = link.href;
      bestScore = score;
    }
  }

  return best;
}

/** Shared look for the ™ beside the header logo; each branch adds its own offsets. */
const TRADEMARK_CLASS =
  "select-none font-gotham text-[11px] font-semibold leading-none text-[#1f2a17] md:text-[13px]";

export default function Header({ settings, categories = [] }: HeaderProps) {
  const { user } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { phone, email, hours } = resolveShopContact(settings);

  // The first few top-level categories, in the order Admin → Categories sets.
  // Each lands on the shop pre-filtered to that category and everything nested
  // under it, so reordering in the admin reorders the nav — no code change.
  const navLinks = [
    ...LEADING_LINKS,
    ...categories
      .filter((category) => !category.parentId)
      .slice(0, NAV_CATEGORY_COUNT)
      .map((category) => ({
        label: category.name,
        href: `/shop?category=${encodeURIComponent(category.name)}`,
      })),
    ...TRAILING_LINKS,
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-mist shadow-sm">
      {/* ── Top utility bar ─────────────────────────────────────────────────
          Hidden on phones — the footer's call/WhatsApp CTA carries the
          numbers there, and the sticky header stays short. */}
      <div className="hidden bg-brand text-white text-[11px] sm:text-[13px] md:block">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-4 md:px-5">
          <div className="flex h-10 items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-5 overflow-hidden whitespace-nowrap">
              <a href={`mailto:${email}`} className="flex items-center gap-1 sm:gap-1.5 hover:underline">
                <HiOutlineMail className="shrink-0" size={15} />
                <span>{email}</span>
              </a>
              <span className="hidden items-center gap-1.5 lg:flex">
                <FiClock className="shrink-0" size={15} />
                <span>Open Daily: {hours}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 whitespace-nowrap">
              <nav className="hidden items-center gap-3 md:flex">
                <Link href="/order-tracking" className="hover:underline">Order Tracking</Link>
                <span className="text-white/50">|</span>
                <Link href="/contact" className="hover:underline">Contact</Link>
                <span className="text-white/50">|</span>
              </nav>

              <a
                href={whatsappHref(phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-1.5 font-medium hover:underline"
              >
                <FaWhatsapp className="shrink-0 text-white" size={15} />
                <span>{phone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main bar ────────────────────────────────────────────────────── */}
      <div className="border-b border-brand/10 bg-brand-mist">
        <div className="mx-auto max-w-[1600px] px-4 md:px-5">
          <div className="flex h-[88px] items-center justify-between gap-4">
            {/* aria-hidden on the ™: the logo's alt text already names the brand,
                so announcing "trademark" again would only add noise. The offsets
                differ per branch because they cancel the artwork's own padding,
                and an admin-uploaded logo has padding of its own (usually none). */}
            <Link href="/" className="flex shrink-0 items-center" aria-label="Organishi home">
              {settings?.logo ? (
                <>
                  {/* `aspect-auto` drops the ratio the width/height props imply, so an
                     admin-uploaded logo of any shape sizes from its own artwork
                     instead of being letterboxed inside a fixed box. */}
                  <Image
                    src={settings.logo}
                    alt={settings.shopName ?? "Organishi"}
                    width={150}
                    height={72}
                    className="aspect-auto w-auto object-contain h-14 md:h-28"
                    priority
                  />
                  <span aria-hidden className={`${TRADEMARK_CLASS} ml-0.5 -mt-[25px] md:-mt-7`}>
                    ™
                  </span>
                </>
              ) : (
                <>
                  <Logo className="h-32 md:h-40" />
                  {/* Logo-English.png is 746×612 with the mark occupying only the
                      middle 338×206 — a third of the box is transparent on every
                      side. These offsets cancel that padding (~0.31 × rendered
                      height to the right, ~0.15 above) so the ™ lands on the mark
                      instead of floating in the empty margin. Rescale them
                      whenever the h-* values above change. */}
                  <span aria-hidden className={`${TRADEMARK_CLASS} -ml-[40px] -mt-[18px] md:-ml-[50px] md:-mt-[23px]`}>
                    ™
                  </span>
                </>
              )}
            </Link>

            {/* min-w-0 + overflow-hidden: category names come from the admin, so a
                long one must clip rather than widen the row past the viewport. */}
            <nav className="hidden min-w-0 items-center gap-5 overflow-hidden xl:flex">
              <NavLinksWithParams links={navLinks} variant="desktop" />
            </nav>


            <div className="flex items-center gap-4 md:gap-5">
            <SearchField className="hidden min-w-[160px] max-w-[320px] flex-1 lg:block" />
              {/* Below lg the search bar stays folded away until this is tapped. */}
              <button
                type="button"
                onClick={() => setSearchOpen((open) => !open)}
                aria-label={searchOpen ? "Close search" : "Search"}
                aria-expanded={searchOpen}
                className="text-[#1f2a17] hover:text-brand lg:hidden"
              >
                <FiSearch size={21} />
              </button>

              <Link href="/cart" aria-label="Cart" className="relative text-[#1f2a17] hover:text-brand">
                <HiOutlineShoppingCart size={23} />
                <Badge count={cartCount} />
              </Link>

              <span className="hidden h-5 w-px bg-gray-200 md:block" />

              {/* On phones the wishlist moves into the menu. */}
              <Link href="/wishlist" aria-label="Wishlist" className="relative hidden text-[#1f2a17] hover:text-brand md:block">
                <HiOutlineHeart size={23} />
                <Badge count={wishlistCount} />
              </Link>

              <span className="hidden h-5 w-px bg-gray-200 md:block" />

              <Link
                href={user ? "/profile" : "/login"}
                aria-label={user ? "My account" : "Sign in"}
                className="text-[#1f2a17] hover:text-brand"
              >
                <FiUser size={22} />
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                className="text-[#1f2a17] xl:hidden"
              >
                {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>

          {/* Search drops below the bar on small screens, once the icon is tapped. */}
          {searchOpen && <SearchField autoFocus className="pb-3 lg:hidden" />}
        </div>

        {mobileOpen && (
          <nav className="border-t border-brand/10 bg-brand-mist xl:hidden">
            <div className="mx-auto flex max-w-[1600px] flex-col px-4 py-2 md:px-5">
              <NavLinksWithParams
                links={navLinks}
                variant="mobile"
                onNavigate={() => setMobileOpen(false)}
              />
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="font-display flex items-center justify-between py-3 text-[17px] text-[#1f2a17] md:hidden"
              >
                Wishlist
                {wishlistCount > 0 && (
                  <span className="flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

interface NavLinksProps {
  links: NavLink[];
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
  /** Null while the static shell renders — the path still decides on its own. */
  params?: URLSearchParams | null;
}

function NavLinks({ links, variant, onNavigate, params = null }: NavLinksProps) {
  const pathname = usePathname();
  const activeHref = activeHrefFor(links, pathname, params);

  return (
    <>
      {links.map((link) => {
        const isActive = link.href === activeHref;

        return (
          <Link
            key={link.label}
            href={link.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={
              variant === "desktop"
                ? `font-display relative whitespace-nowrap py-1 text-[17px] transition-colors hover:text-brand ${
                    isActive
                      ? "font-semibold text-brand after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-brand after:content-['']"
                      : "text-[#1f2a17]"
                  }`
                : `font-display border-b border-brand/10 py-3 text-[17px] transition-colors last:border-b-0 ${
                    isActive ? "font-semibold text-brand" : "text-[#1f2a17]"
                  }`
            }
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

/**
 * The category and Offers links are told apart by their query string, so the
 * active one can only be known once `useSearchParams` has run. That hook opts a
 * statically rendered page out of the prerender unless it sits behind a
 * Suspense boundary, hence the split: the shell ships the path-only highlight
 * and the query-aware one takes over on hydration.
 */
function NavLinksWithParams(props: Omit<NavLinksProps, "params">) {
  return (
    <Suspense fallback={<NavLinks {...props} />}>
      <NavLinksReadingParams {...props} />
    </Suspense>
  );
}

function NavLinksReadingParams(props: Omit<NavLinksProps, "params">) {
  const params = useSearchParams();
  return <NavLinks {...props} params={params} />;
}

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
