import type { Locale } from "@/lib/i18n/locales";
import { DraggableFloat } from "./draggable-float";
import { PandaPalLoader } from "./panda-pal/panda-pal-loader";
import { ScrollTopButton } from "./scroll-top-button";

type FloatingActionsProps = {
  locale: Locale;
  phone: string;
  telHref: string;
  whatsappHref: string;
};

/** Corner stack on every storefront page: Tulo the panda over the back-to-top button. Draggable on phones. */
export function FloatingActions({ locale, phone, telHref, whatsappHref }: FloatingActionsProps) {
  return (
    <DraggableFloat className="pointer-events-none floating-actions fixed right-3 z-[60] flex flex-col items-center gap-1.5 md:bottom-5 md:right-5">
      <PandaPalLoader locale={locale} phone={phone} telHref={telHref} whatsappHref={whatsappHref} />
      <ScrollTopButton />
    </DraggableFloat>
  );
}
