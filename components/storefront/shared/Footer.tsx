"use client";

import Image from "next/image";
import Link from "next/link";
import { HiOutlineClock, HiOutlineMail, HiOutlinePhone } from "react-icons/hi";
import { HiOutlineMapPin } from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";

import Logo from "./Logo";
import { activeSocialLinks } from "./social-platforms";
import { BLOG_ENABLED } from "@/lib/feature-flags";
import type { Policy } from "@/types/policies";
import type { ShopSettings } from "@/lib/shop-api";
import { resolveShopContact, telHref, whatsappHref } from "@/lib/shop-contact";

interface FooterProps {
  policies?: Policy[];
  settings?: ShopSettings | null;
  /** Category links for the "Our Product" column; falls back to the core range. */
  productLinks?: { label: string; href: string }[];
}

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  ...(BLOG_ENABLED ? [{ label: "Our Blog", href: "/blog" }] : []),
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

const FALLBACK_PRODUCTS = [
  { label: "Ghee", href: "/shop?category=Ghee%20%26%20Dairy" },
  { label: "Mustard oil", href: "/shop?category=Mustard%20Oil" },
  {
    label: "Organic Chip",
    href: "/shop?category=Organic%20Chips%20%26%20Snacks",
  },
  { label: "Maca cacao powder", href: "/shop?category=Spices%20%26%20Masala" },
  { label: "Coconut Virgin Oil", href: "/shop?category=Coconut%20Oil" },
  {
    label: "Organic Soup",
    href: "/shop?category=Rice%2C%20Grains%20%26%20Pulses",
  },
];

/** Plain brand-green icon on phones; boxed tile from md up. */
const CONTACT_ICON_CLASS =
  "mt-0.5 flex shrink-0 items-center justify-center text-brand md:h-9 md:w-9 md:rounded-md md:border md:border-brand/30 md:bg-white";

const PAYMENTS = [
  "Cash on Delivery",
  "bKash",
  "Nagad",
  "Rocket",
  "VISA",
  "Mastercard",
];

export default function Footer({ settings, productLinks }: FooterProps) {
  // Everything in the brand blurb and the Contact Us column is admin-managed;
  // `resolveShopContact` falls back to the shop defaults until it is filled in.
  const { phones, emails, address, hours, footerDescription } =
    resolveShopContact(settings);
  const products = productLinks?.length ? productLinks : FALLBACK_PRODUCTS;
  // Only the platforms the admin actually filled in are linked.
  const socials = activeSocialLinks(settings?.socialContact);

  // First number takes calls, the second WhatsApp; a shop with one number uses it for both.
  const callNumber = phones[0].value;
  const whatsappNumber = phones[1]?.value ?? callNumber;

  return (
    <footer className="bg-brand-mist text-[#1f2a17]">
      {/* ── Contact CTA ──────────────────────────────────────────────────────
          A card inside the page container, lined up with the footer columns.
          Stacked and centred on phones; copy left, buttons right from md up. */}
      <div className="mx-auto max-w-[1600px] px-4 pt-10 md:px-8 md:pt-14">
        <div className="flex flex-col gap-6 rounded-2xl bg-brand px-5 py-8 text-center text-white md:flex-row md:items-center md:justify-between md:px-10 md:py-10 md:text-left">
          <div>
            <h2 className="font-display text-[22px] font-bold leading-tight md:text-[32px]">
              যোগাযোগ করুন
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-white/85 md:mx-0 md:max-w-md md:text-[16px]">
              যেকোনো প্রয়োজনে আমাদের কল করুন অথবা হোয়াটসঅ্যাপে মেসেজ দিন
            </p>
          </div>
          <div className="mx-auto grid w-full max-w-sm gap-3 md:mx-0 md:w-auto md:max-w-none md:shrink-0 md:grid-cols-2 md:gap-4">
            <a
              href={telHref(callNumber)}
              className="flex items-center gap-4 rounded-full bg-white py-2.5 pl-2.5 pr-6 text-left text-brand shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                <HiOutlinePhone size={24} />
              </span>
              <span className="min-w-0">
                <span className="block text-[18px] font-bold leading-tight">
                  কল করুন
                </span>
                <span className="block text-[15px] font-semibold tracking-wide text-[#1f2a17]">
                  {callNumber}
                </span>
              </span>
            </a>
            {/* WhatsApp's own brand green, so the button reads as WhatsApp at a glance. */}
            <a
              href={whatsappHref(whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-full bg-[#25D366] py-2.5 pl-2.5 pr-6 text-left text-white shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#25D366]">
                <FaWhatsapp size={26} />
              </span>
              <span className="min-w-0">
                <span className="block text-[18px] font-bold leading-tight">
                  হোয়াটসঅ্যাপ
                </span>
                <span className="block text-[15px] font-semibold tracking-wide">
                  {whatsappNumber}
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-8 md:py-14 lg:py-16">
        {/* Phones: brand row full width, the two link lists side by side, contact below. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 md:gap-10 lg:grid-cols-4 lg:gap-8">
          {/* Brand — logo centred over a full-width blurb on phones. */}
          <div className="col-span-2 flex flex-col items-center text-center md:col-span-1 md:block md:max-w-sm md:text-left">
            {/* h-80 is 5x the old h-16. `max-w-full` is what keeps that from
                bursting the brand column on narrower grids: paired with
                object-contain the artwork just fits itself into whatever width
                the column has, instead of overflowing into the next one. The
                width/height props are only srcset hints, so they have to be big
                enough for a 320px-tall render or the optimiser serves a blurry
                source. */}
            <Link
              href="/"
              aria-label="Organishi home"
              className="inline-flex w-64 md:w-auto"
            >
              {settings?.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.shopName ?? "Organishi"}
                  width={400}
                  height={200}
                  className="aspect-auto h-auto w-full object-contain md:h-80 md:w-auto md:max-w-full"
                />
              ) : (
                <Logo className="h-auto w-full md:h-52 md:w-auto md:max-w-full" />
              )}
            </Link>

            <div className="mt-3 w-full md:mt-0">
              {settings?.slogan && (
                <p className="font-display text-[15px] font-semibold text-brand md:mt-5">
                  {settings.slogan}
                </p>
              )}

              <p className="mt-1 text-[13px] leading-relaxed text-gray-600 md:mt-3 md:text-sm">
                {footerDescription}
              </p>
            </div>

            {/* The phone CTA above covers this on phones. */}
            <div className="mt-6 hidden items-center gap-3 md:flex">
              <span className="flex h-11 w-11 items-center justify-center rounded-md border border-brand/30 bg-white text-brand">
                <HiOutlinePhone size={20} />
              </span>
              <div>
                <p className="text-sm text-gray-500">
                  {phones[0].title || "For Any Help"}
                </p>
                <a
                  href={telHref(phones[0].value)}
                  className="font-display text-lg font-semibold transition-colors hover:text-brand"
                >
                  {phones[0].value}
                </a>
              </div>
            </div>
          </div>

          <FooterColumn title="Quick Link" links={QUICK_LINKS} />
          <FooterColumn title="Our Product" links={products} />

          {/* Contact */}
          <div className="col-span-2 text-center md:col-span-1 md:text-left">
            <h3 className="font-display mb-4 text-[18px] font-semibold md:mb-6 md:text-[22px]">
              Contact Us
            </h3>
            {/* Phones: one tap target per channel, no text. */}
            <div className="flex items-center justify-center gap-3 md:hidden">
              {[
                {
                  label: "Find us on the map",
                  href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
                  Icon: HiOutlineMapPin,
                  external: true,
                },
                {
                  label: "Call us",
                  href: telHref(callNumber),
                  Icon: HiOutlinePhone,
                },
                {
                  label: "WhatsApp us",
                  href: whatsappHref(whatsappNumber),
                  Icon: FaWhatsapp,
                  external: true,
                },
                {
                  label: "Email us",
                  href: `mailto:${emails[0].value}`,
                  Icon: HiOutlineMail,
                },
              ].map(({ label, href, Icon, external }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-brand/30 bg-white text-brand transition-colors hover:bg-brand hover:text-white"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>

            <ul className="hidden space-y-4 text-sm text-gray-600 md:block">
              <li className="flex gap-3">
                <span className={CONTACT_ICON_CLASS}>
                  <HiOutlineMapPin size={18} />
                </span>
                <span className="leading-relaxed">{address}</span>
              </li>
              <li className="flex gap-3">
                <span className={CONTACT_ICON_CLASS}>
                  <HiOutlinePhone size={18} />
                </span>
                <span className="space-y-1.5">
                  {phones.map((entry) => (
                    <span key={entry.value} className="block">
                      {entry.title && (
                        <span className="block text-xs text-gray-400">
                          {entry.title}
                        </span>
                      )}
                      <a
                        href={telHref(entry.value)}
                        className="hover:text-brand"
                      >
                        {entry.value}
                      </a>
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex gap-3">
                <span className={CONTACT_ICON_CLASS}>
                  <HiOutlineMail size={18} />
                </span>
                <span className="space-y-1.5">
                  {emails.map((entry) => (
                    <span key={entry.value} className="block">
                      {entry.title && (
                        <span className="block text-xs text-gray-400">
                          {entry.title}
                        </span>
                      )}
                      <a
                        href={`mailto:${entry.value}`}
                        className="break-all hover:text-brand"
                      >
                        {entry.value}
                      </a>
                    </span>
                  ))}
                </span>
              </li>
              {/* Opening hours stay off the phone footer to keep it short. */}
              <li className="hidden gap-3 md:flex">
                <span className={CONTACT_ICON_CLASS}>
                  <HiOutlineClock size={18} />
                </span>
                <span>
                  <span className="block text-xs text-gray-400">
                    Open Daily
                  </span>
                  {hours}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div className="border-t border-brand/15">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-4 px-4 py-5 md:flex-row md:justify-between md:px-8">
          <div className="flex items-center gap-2.5">
            {socials.map(({ key, label, Icon, href }) => (
              <SocialLink key={key} href={href} label={label}>
                <Icon size={14} />
              </SocialLink>
            ))}
          </div>

          <p className="text-center text-sm font-medium text-stone-500">
            © {new Date().getFullYear()} {settings?.shopName ?? "Organishi"}.
            All Rights Reserved.
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
      <h3 className="font-display mb-4 text-[18px] font-semibold md:mb-6 md:text-[22px]">
        {title}
      </h3>
      <ul className="space-y-3 md:space-y-3.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="flex items-center gap-2.5 text-sm text-gray-600 transition-colors hover:text-brand"
            >
              <span className="h-[7px] w-[7px] shrink-0 bg-brand" />
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
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded border border-brand/30 bg-white text-brand transition-colors hover:bg-brand hover:text-white"
    >
      {children}
    </a>
  );
}
