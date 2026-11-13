"use client";

import { FaWhatsapp } from "react-icons/fa";
import { useAppSelector } from "@/lib/store/hooks";
import { selectIsWhatsappHighlighted } from "@/lib/store/slices/ui-slice";

/** The selector the home page's stitched needle aims at. */
export const WHATSAPP_FAB_SELECTOR = "[data-whatsapp-fab]";

/**
 * The floating WhatsApp chat button. When the home page's thread has been
 * sewn to the end and points here, it blinks (a pulsing ring) and says
 * "Chat with us", so shoppers know they can get in touch.
 */
export function WhatsappButton({ href }: { href: string }) {
  const highlighted = useAppSelector(selectIsWhatsappHighlighted);
  return (
    <a
      data-whatsapp-fab
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message us on WhatsApp"
      className="relative grid size-12 place-items-center rounded-full bg-[#25D366] text-white shadow-sheet transition-transform duration-300 ease-(--ease-quiet) hover:scale-105"
    >
      {highlighted ? (
        <>
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/70 motion-reduce:animate-none" />
          <span
            aria-hidden
            className="type-label absolute right-full mr-3 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-chalk shadow-sheet motion-safe:animate-pulse"
          >
            Chat with us
          </span>
        </>
      ) : null}
      <FaWhatsapp aria-hidden className={`relative size-6 ${highlighted ? "motion-safe:animate-pulse" : ""}`} />
    </a>
  );
}
