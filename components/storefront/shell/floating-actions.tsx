import { FaWhatsapp } from "react-icons/fa";
import { whatsappHref } from "@/utils/storefront/whatsapp";
import { ScrollTopButton } from "./scroll-top-button";

/** Bottom-right stack on every storefront page: back to top, and a WhatsApp chat with the shop. */
export function FloatingActions({ phone, shopName }: { phone: string | null; shopName: string }) {
  const href = whatsappHref(phone, `Hi ${shopName}, I have a question.`);
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-center gap-3 md:bottom-6 md:right-6">
      <ScrollTopButton />
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Message us on WhatsApp"
          className="grid size-12 place-items-center rounded-full bg-[#25D366] text-white shadow-sheet transition-transform duration-300 ease-(--ease-quiet) hover:scale-105"
        >
          <FaWhatsapp aria-hidden className="size-6" />
        </a>
      ) : null}
    </div>
  );
}
