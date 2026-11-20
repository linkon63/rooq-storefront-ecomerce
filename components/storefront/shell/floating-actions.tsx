import type { Locale } from "@/lib/i18n/locales";
import { PandaPalLoader } from "./panda-pal/panda-pal-loader";
import { ScrollTopButton } from "./scroll-top-button";

type FloatingActionsProps = {
  locale: Locale;
  phone: string;
  telHref: string;
  whatsappHref: string;
};

/** Bottom-right stack on every storefront page: Tulo the panda on top of the back-to-top button. */
export function FloatingActions({ locale, phone, telHref, whatsappHref }: FloatingActionsProps) {
  return (
    <div className="pointer-events-none fixed bottom-20 right-3 z-[60] flex flex-col items-center gap-1.5 md:bottom-5 md:right-5">
      <PandaPalLoader locale={locale} phone={phone} telHref={telHref} whatsappHref={whatsappHref} />
      <ScrollTopButton />
    </div>
  );
}
