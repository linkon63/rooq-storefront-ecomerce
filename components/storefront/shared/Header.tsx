"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { FiClock, FiUser, FiMenu, FiX } from "react-icons/fi";
import { HiOutlineShoppingCart, HiOutlineHeart } from "react-icons/hi2";

import Logo from "./Logo";
import SearchField from "./SearchField";
import type { ShopCategory, ShopSettings } from "@/lib/shop-api";
import { BLOG_ENABLED } from "@/lib/feature-flags";
import { resolveShopContact, telHref } from "@/lib/shop-contact";
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

/** Shared look for the ™ beside the header logo; each branch adds its own offsets. */
const TRADEMARK_CLASS =
  "select-none font-gotham text-[11px] font-semibold leading-none text-[#1f2a17] md:text-[13px]";

export default function Header({ settings, categories = [] }: HeaderProps) {
  const { user } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const [mobileOpen, setMobileOpen] = useState(false);

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
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* ── Top utility bar ─────────────────────────────────────────────── */}
      <div className="bg-[#4a9e2f] text-white text-[13px]">
        <div className="mx-auto max-w-[1600px] px-4 md:px-5">
          <div className="flex h-10 items-center justify-between gap-4">
            <div className="flex items-center gap-5 overflow-hidden whitespace-nowrap">
              <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:underline">
                <HiOutlineMail className="shrink-0" size={15} />
                <span>{email}</span>
              </a>
              <a href={telHref(phone)} className="hidden items-center gap-1.5 hover:underline sm:flex">
                <HiOutlinePhone className="shrink-0" size={15} />
                <span>{phone}</span>
              </a>
              <span className="hidden items-center gap-1.5 lg:flex">
                <FiClock className="shrink-0" size={15} />
                <span>Open Daily: {hours}</span>
              </span>
            </div>

            <nav className="hidden items-center gap-3 md:flex">
              <Link href="/order-tracking" className="hover:underline">Order Tracking</Link>
              <span className="text-white/50">|</span>
              <Link href="/contact" className="hover:underline">Contact</Link>
            </nav>
          </div>
        </div>
      </div>

      {/* ── Main bar ────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white">
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
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-display whitespace-nowrap text-[17px] text-[#1f2a17] transition-colors first:text-[#4a9e2f] hover:text-[#4a9e2f]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>


            <div className="flex items-center gap-4 md:gap-5">
            <SearchField className="hidden min-w-[160px] max-w-[320px] flex-1 lg:block" />
              <Link href="/cart" aria-label="Cart" className="relative text-[#1f2a17] hover:text-[#4a9e2f]">
                <HiOutlineShoppingCart size={23} />
                <Badge count={cartCount} />
              </Link>

              <span className="hidden h-5 w-px bg-gray-200 md:block" />

              <Link href="/wishlist" aria-label="Wishlist" className="relative text-[#1f2a17] hover:text-[#4a9e2f]">
                <HiOutlineHeart size={23} />
                <Badge count={wishlistCount} />
              </Link>

              <span className="hidden h-5 w-px bg-gray-200 md:block" />

              <Link
                href={user ? "/profile" : "/login"}
                aria-label={user ? "My account" : "Sign in"}
                className="text-[#1f2a17] hover:text-[#4a9e2f]"
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

          {/* Search drops below the bar on small screens. */}
          <SearchField className="pb-3 lg:hidden" />
        </div>

        {mobileOpen && (
          <nav className="border-t border-gray-100 bg-white xl:hidden">
            <div className="mx-auto flex max-w-[1600px] flex-col px-4 py-2 md:px-5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-display border-b border-gray-50 py-3 text-[17px] text-[#1f2a17] last:border-b-0"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#4a9e2f] px-1 text-[10px] font-semibold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
