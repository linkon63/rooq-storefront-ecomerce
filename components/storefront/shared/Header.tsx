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
import { useAuth } from "@/app/_providers/auth-provider";
import { useCart } from "@/app/_providers/cart-provider";
import { useWishlist } from "@/app/_providers/wishlist-provider";

interface HeaderProps {
  settings?: ShopSettings | null;
  categories?: ShopCategory[];
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Blog", href: "/blog" },
  { label: "Combo", href: "/shop?tag=combo" },
  { label: "Offers", href: "/shop?discounted=1" },
  { label: "Contact", href: "/contact" },
];

/** First entry of a JSON contact column, which the API returns as an array. */
function firstOf(value: unknown, fallback: string): string {
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  if (typeof value === "string") return value;
  return fallback;
}

export default function Header({ settings }: HeaderProps) {
  const { user } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const [mobileOpen, setMobileOpen] = useState(false);

  const email = firstOf(settings?.email, "support@organishi.com");
  const phone = firstOf(settings?.contactNumber, "+880 1811 000111");

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* ── Top utility bar ─────────────────────────────────────────────── */}
      <div className="bg-[#4a9e2f] text-white text-[13px]">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8">
          <div className="flex h-10 items-center justify-between gap-4">
            <div className="flex items-center gap-5 overflow-hidden whitespace-nowrap">
              <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:underline">
                <HiOutlineMail className="shrink-0" size={15} />
                <span>{email}</span>
              </a>
              <a href={`tel:${phone}`} className="hidden items-center gap-1.5 hover:underline sm:flex">
                <HiOutlinePhone className="shrink-0" size={15} />
                <span>{phone}</span>
              </a>
              <span className="hidden items-center gap-1.5 lg:flex">
                <FiClock className="shrink-0" size={15} />
                <span>Mon-Fri: 8:00am-7:00pm</span>
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
        <div className="mx-auto max-w-[1600px] px-4 md:px-8">
          <div className="flex h-[72px] items-center justify-between gap-4 md:h-[86px]">
            <Link href="/" className="flex shrink-0 items-center" aria-label="Organishi home">
              {settings?.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.shopName ?? "Organishi"}
                  width={150}
                  height={48}
                  className="h-10 w-auto object-contain md:h-12"
                  priority
                />
              ) : (
                <Logo className="h-10 w-[150px] md:h-12 md:w-[176px]" />
              )}
            </Link>

            <nav className="hidden items-center gap-8 xl:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="font-display text-[17px] text-[#1f2a17] transition-colors first:text-[#4a9e2f] hover:text-[#4a9e2f]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <SearchField className="hidden max-w-[430px] flex-1 lg:block" />

            <div className="flex items-center gap-4 md:gap-5">
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
            <div className="mx-auto flex max-w-[1600px] flex-col px-4 py-2 md:px-8">
              {NAV_LINKS.map((link) => (
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
