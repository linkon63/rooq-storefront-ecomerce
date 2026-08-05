"use client";

import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { HiOutlineMapPin } from "react-icons/hi2";

import Logo from "./Logo";
import type { Policy } from "@/types/policies";
import type { ShopSettings } from "@/lib/shop-api";

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
];

const FALLBACK_PRODUCTS = [
  { label: "Ghee", href: "/shop?category=Ghee%20%26%20Dairy" },
  { label: "Mustard oil", href: "/shop?category=Mustard%20Oil" },
  { label: "Organic Chip", href: "/shop?category=Organic%20Chips%20%26%20Snacks" },
  { label: "Maca cacao powder", href: "/shop?category=Spices%20%26%20Masala" },
  { label: "Coconut Virgin Oil", href: "/shop?category=Coconut%20Oil" },
  { label: "Organic Soup", href: "/shop?category=Rice%2C%20Grains%20%26%20Pulses" },
];

const PAYMENTS = ["VISA", "Mastercard", "AMEX", "GPay", "Payoneer", "stripe"];

/** Contact columns come back from the API as JSON arrays. */
function toList(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    const items = value.filter((entry): entry is string => typeof entry === "string");
    if (items.length) return items;
  }
  if (typeof value === "string" && value) return [value];
  return fallback;
}

export default function Footer({ settings, productLinks }: FooterProps) {
  const phones = toList(settings?.contactNumber, ["+880 1811 000111", "+880 9613 800800"]);
  const emails = toList(settings?.email, ["info@organishi.com", "support@organishi.com"]);
  const address = settings?.branchAddress ?? "House 42, Road 11, Banani, Dhaka 1213, Bangladesh";
  const products = productLinks?.length ? productLinks : FALLBACK_PRODUCTS;
  const social = (settings?.socialContact ?? {}) as Record<string, string | undefined>;

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

            <p className="mt-5 text-sm leading-relaxed text-gray-600">
              {settings?.slogan ??
                "Pure, organic and straight from the farm — cold pressed oils, hand-churned ghee and raw honey, sourced directly from the families who make them."}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-md border border-[#4a9e2f]/30 bg-white text-[#4a9e2f]">
                <HiOutlinePhone size={20} />
              </span>
              <div>
                <p className="text-sm text-gray-500">For Any Help</p>
                <a href={`tel:${phones[0]}`} className="font-display text-lg font-semibold">
                  {phones[0]}
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
                <span className="space-y-1">
                  {phones.map((number) => (
                    <a key={number} href={`tel:${number}`} className="block hover:text-[#4a9e2f]">
                      {number}
                    </a>
                  ))}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#4a9e2f]/30 bg-white text-[#4a9e2f]">
                  <HiOutlineMail size={18} />
                </span>
                <span className="space-y-1">
                  {emails.map((mail) => (
                    <a key={mail} href={`mailto:${mail}`} className="block hover:text-[#4a9e2f]">
                      {mail}
                    </a>
                  ))}
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
            <SocialLink href={social.facebook} label="Facebook"><FaFacebookF size={14} /></SocialLink>
            <SocialLink href={social.instagram} label="Instagram"><FaInstagram size={14} /></SocialLink>
            <SocialLink href={social.linkedin} label="LinkedIn"><FaLinkedinIn size={14} /></SocialLink>
            <SocialLink href={social.twitter} label="X"><FaXTwitter size={14} /></SocialLink>
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
  href?: string;
  label: string;
  children: React.ReactNode;
}) {
  if (!href) return null;
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
