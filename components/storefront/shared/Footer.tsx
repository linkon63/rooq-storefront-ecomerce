"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { HiOutlineClock, HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { HiOutlineMapPin } from "react-icons/hi2";

import Logo from "./Logo";
import type { Policy } from "@/types/policies";
import type { ShopSettings } from "@/lib/shop-api";
import { resolveShopContact, telHref } from "@/lib/shop-contact";

interface FooterProps {
  policies?: Policy[];
  settings?: ShopSettings | null;
  /** Category links for the "Our Product" column; falls back to the core range. */
  productLinks?: { label: string; href: string }[];
}

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Our Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

const FALLBACK_PRODUCTS = [
  { label: "Ghee", href: "/shop?category=Ghee%20%26%20Dairy" },
  { label: "Mustard oil", href: "/shop?category=Mustard%20Oil" },
  { label: "Organic Chip", href: "/shop?category=Organic%20Chips%20%26%20Snacks" },
  { label: "Maca cacao powder", href: "/shop?category=Spices%20%26%20Masala" },
  { label: "Coconut Virgin Oil", href: "/shop?category=Coconut%20Oil" },
  { label: "Organic Soup", href: "/shop?category=Rice%2C%20Grains%20%26%20Pulses" },
];

const PAYMENTS = ["Cash on Delivery", "bKash", "Nagad", "Rocket", "VISA", "Mastercard"];

/** Rendered in this order, skipping any platform the admin left blank. */
const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "youtube", label: "YouTube", Icon: FaYoutube },
  { key: "tiktok", label: "TikTok", Icon: FaTiktok },
  { key: "twitter", label: "X", Icon: FaXTwitter },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
] as const;

export default function Footer({ settings, productLinks }: FooterProps) {
  // Everything in the brand blurb and the Contact Us column is admin-managed;
  // `resolveShopContact` falls back to the shop defaults until it is filled in.
  const { phones, emails, address, hours, footerDescription } = resolveShopContact(settings);
  const products = productLinks?.length ? productLinks : FALLBACK_PRODUCTS;
  const social = settings?.socialContact ?? {};

  return (
    <footer className="bg-[#f4f7ee] text-[#1f2a17]">
      <div className="mx-auto max-w-[1600px] px-4 py-14 md:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" aria-label="Organishi home" className="inline-flex">
              {settings?.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.shopName ?? "Organishi"}
                  width={160}
                  height={52}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <Logo className="h-12 w-[176px]" />
              )}
            </Link>

            {settings?.slogan && (
              <p className="font-display mt-5 text-[15px] font-semibold text-[#4a9e2f]">
                {settings.slogan}
              </p>
            )}

            <p className="mt-3 text-sm leading-relaxed text-gray-600">{footerDescription}</p>

            <div className="mt-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-md border border-[#4a9e2f]/30 bg-white text-[#4a9e2f]">
                <HiOutlinePhone size={20} />
              </span>
              <div>
                <p className="text-sm text-gray-500">{phones[0].title || "For Any Help"}</p>
                <a
                  href={telHref(phones[0].value)}
                  className="font-display text-lg font-semibold transition-colors hover:text-[#4a9e2f]"
                >
                  {phones[0].value}
                </a>
              </div>
            </div>
          </div>

          <FooterColumn title="Quick Link" links={QUICK_LINKS} />
          <FooterColumn title="Our Product" links={products} />

          {/* Contact */}
          <div>
            <h3 className="font-display mb-6 text-[22px] font-semibold">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#4a9e2f]/30 bg-white text-[#4a9e2f]">
                  <HiOutlineMapPin size={18} />
                </span>
                <span className="leading-relaxed">{address}</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#4a9e2f]/30 bg-white text-[#4a9e2f]">
                  <HiOutlinePhone size={18} />
                </span>
                <span className="space-y-1.5">
                  {phones.map((entry) => (
                    <span key={entry.value} className="block">
                      {entry.title && (
                        <span className="block text-xs text-gray-400">{entry.title}</span>
                      )}
                      <a href={telHref(entry.value)} className="hover:text-[#4a9e2f]">
                        {entry.value}
                      </a>
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#4a9e2f]/30 bg-white text-[#4a9e2f]">
                  <HiOutlineMail size={18} />
                </span>
                <span className="space-y-1.5">
                  {emails.map((entry) => (
                    <span key={entry.value} className="block">
                      {entry.title && (
                        <span className="block text-xs text-gray-400">{entry.title}</span>
                      )}
                      <a href={`mailto:${entry.value}`} className="break-all hover:text-[#4a9e2f]">
                        {entry.value}
                      </a>
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#4a9e2f]/30 bg-white text-[#4a9e2f]">
                  <HiOutlineClock size={18} />
                </span>
                <span>
                  <span className="block text-xs text-gray-400">Open Daily</span>
                  {hours}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div className="border-t border-[#4a9e2f]/15">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-4 px-4 py-5 md:flex-row md:justify-between md:px-8">
          <div className="flex items-center gap-2.5">
            {SOCIAL_PLATFORMS.map(({ key, label, Icon }) => (
              <SocialLink key={key} href={social[key]} label={label}>
                <Icon size={14} />
              </SocialLink>
            ))}
          </div>

          <p className="text-center text-sm font-medium text-stone-500">
            © {new Date().getFullYear()} {settings?.shopName ?? "Organishi"}. All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {PAYMENTS.map((name) => (
              <span
                key={name}
                className="flex h-7 items-center rounded border border-gray-200 bg-white px-2 text-[10px] font-semibold tracking-wide text-gray-500"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="font-display mb-6 text-[22px] font-semibold">{title}</h3>
      <ul className="space-y-3.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="flex items-center gap-2.5 text-sm text-gray-600 transition-colors hover:text-[#4a9e2f]"
            >
              <span className="h-[7px] w-[7px] shrink-0 bg-[#4a9e2f]" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href?: string | null;
  label: string;
  children: React.ReactNode;
}) {
  if (!href?.trim()) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded border border-[#4a9e2f]/30 bg-white text-[#4a9e2f] transition-colors hover:bg-[#4a9e2f] hover:text-white"
    >
      {children}
    </a>
  );
}
