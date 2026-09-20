"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowUp, FiX } from "react-icons/fi";
import { HiOutlineChatBubbleLeftRight, HiOutlineEnvelope, HiOutlinePhone } from "react-icons/hi2";

import type { ShopSettings } from "@/lib/shop-api";
import { resolveShopContact, telHref, whatsappChatHref } from "@/lib/shop-contact";

const EMAIL_SUBJECT = "Organishi — Product enquiry";

/** These pages pin their own action bar to the bottom on phones; sit above it. */
const RAISED_ON = ["/product/", "/checkout", "/cart"];
/** Checkout keeps its order bar on every screen size, so it lifts on desktop too. */
const RAISED_ON_DESKTOP = ["/checkout"];

/** How far down the page before "back to top" appears. */
const SHOW_TOP_AFTER = 400;

/**
 * Bottom-right corner, every screen size: a contact button that fans out into
 * call, WhatsApp and e-mail. Numbers follow the footer CTA — the first phone
 * takes calls, the second WhatsApp (or the first again when there is only one).
 * From md up a "back to top" arrow sits above it once the page is scrolled.
 *
 * Once open it stays open: only the ✕ closes it (or Escape, or picking one of
 * the channels). Tapping the page behind it does nothing, so a shopper can
 * keep reading with the numbers in reach.
 */
export default function FloatingContact({ settings }: { settings?: ShopSettings | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SHOW_TOP_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { phones, email } = resolveShopContact(settings);
  const callNumber = phones[0].value;
  const whatsappNumber = phones[1]?.value ?? callNumber;

  // Close on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes it, as it does any other popover.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const raised = RAISED_ON.some((path) => pathname.startsWith(path));
  const raisedOnDesktop = RAISED_ON_DESKTOP.some((path) => pathname.startsWith(path));

  const actions = [
    {
      label: "Call us",
      href: telHref(callNumber),
      Icon: HiOutlinePhone,
      className: "bg-brand",
    },
    {
      label: "WhatsApp us",
      href: whatsappChatHref(whatsappNumber),
      Icon: FaWhatsapp,
      className: "bg-[#25D366]",
      external: true,
    },
    {
      label: "Email us",
      href: `mailto:${email}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`,
      Icon: HiOutlineEnvelope,
      className: "bg-[#1f2a17]",
    },
  ];

  return (
    // The column itself ignores the pointer — only the buttons in it catch
    // clicks — so the empty space above the closed menu never blocks the page.
    <div
      className={`pointer-events-none fixed right-4 z-40 flex flex-col items-center gap-3 md:right-6 ${
        raised ? "bottom-24" : "bottom-5"
      } ${raisedOnDesktop ? "md:bottom-36" : "md:bottom-6"}`}
    >
      <div
        id="floating-contact-actions"
        className={`flex flex-col items-center gap-3 transition-all duration-200 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        {actions.map(({ label, href, Icon, className, external }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg ${className}`}
          >
            <Icon size={21} />
          </a>
        ))}
      </div>

      {/* Back to top — PC only, once scrolled, and out of the way while the
          contact menu is open. */}
      {scrolled && !open && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="pointer-events-auto hidden h-12 w-12 items-center justify-center rounded-full border border-brand/30 bg-white text-brand shadow-lg transition-colors hover:bg-brand hover:text-white md:flex"
        >
          <FiArrowUp size={22} />
        </button>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close contact options" : "Contact us"}
        aria-expanded={open}
        aria-controls="floating-contact-actions"
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-xl transition-colors hover:bg-brand-dark"
      >
        {open ? <FiX size={24} /> : <HiOutlineChatBubbleLeftRight size={26} />}
      </button>
    </div>
  );
}
