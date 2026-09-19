"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { HiOutlineChatBubbleLeftRight, HiOutlineEnvelope, HiOutlinePhone } from "react-icons/hi2";

import type { ShopSettings } from "@/lib/shop-api";
import { resolveShopContact, telHref, whatsappChatHref } from "@/lib/shop-contact";

const EMAIL_SUBJECT = "Organishi — Product enquiry";

/** These pages pin their own action bar to the bottom on phones; sit above it. */
const RAISED_ON = ["/product/", "/checkout"];

/**
 * Phones only: a contact button in the bottom-right corner that fans out into
 * call, WhatsApp and e-mail. Numbers follow the footer CTA — the first phone
 * takes calls, the second WhatsApp (or the first again when there is only one).
 */
export default function FloatingContact({ settings }: { settings?: ShopSettings | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { phones, email } = resolveShopContact(settings);
  const callNumber = phones[0].value;
  const whatsappNumber = phones[1]?.value ?? callNumber;

  // Close on navigation and on a tap anywhere else.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const raised = RAISED_ON.some((path) => pathname.startsWith(path));

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
    <div
      ref={rootRef}
      className={`fixed right-4 z-40 flex flex-col items-center gap-3 md:hidden ${
        raised ? "bottom-24" : "bottom-5"
      }`}
    >
      <div
        id="floating-contact-actions"
        className={`flex flex-col items-center gap-3 transition-all duration-200 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
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

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close contact options" : "Contact us"}
        aria-expanded={open}
        aria-controls="floating-contact-actions"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-xl"
      >
        {open ? <FiX size={24} /> : <HiOutlineChatBubbleLeftRight size={26} />}
      </button>
    </div>
  );
}
