import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { WHATSAPP_NUMBER, whatsappChatHref } from "@/lib/shop-contact";
import type { Messages } from "@/lib/i18n/messages";
import type { NavItem } from "@/types/storefront/catalog";
import type { StorePolicy, StoreSettings } from "@/types/storefront/content";
import Logo from "../shared/Logo";
import { FooterWeavingArt } from "./footer-art/footer-weaving-art";
import { FooterPayments } from "./footer-payments";
import { NewsletterForm } from "./newsletter-form";
import { SocialLinks } from "./social-links";

type SiteFooterProps = { nav: NavItem[]; settings: StoreSettings; policies: StorePolicy[]; t: Messages["footer"]; newsletter: Messages["newsletter"] };

const HELP_LINKS = [
  { key: "contactUs", href: "/contact" },
  { key: "faq", href: "/faq" },
  { key: "trackOrder", href: "/profile?tab=orders" },
  { key: "startReturn", href: "/profile?tab=returns" },
] as const;

/** Footer: newsletter, shop and help links, contact and policies from Settings. */
export function SiteFooter({ nav, settings, policies, t, newsletter }: SiteFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-ink text-chalk">
      <div className="page-gutter grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-5">
          <Logo kechi variant="light" className="h-auto w-44 self-start" />
          {settings.footerDescription ? <p className="max-w-[42ch] text-sm text-chalk/75">{settings.footerDescription}</p> : null}
          <NewsletterForm t={newsletter} />
        </div>
        <nav aria-label={t.shop}>
          <h2 className="mb-4 text-sm font-semibold">{t.shop}</h2>
          <ul className="flex flex-col gap-2.5 text-sm text-chalk/80">
            {nav.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-chalk hover:underline">
                  {item.label}
                  {item.soon ? <span className="ml-1.5 text-chalk/50">{t.soon}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.help}>
          <h2 className="mb-4 text-sm font-semibold">{t.help}</h2>
          <ul className="flex flex-col gap-2.5 text-sm text-chalk/80">
            {HELP_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-chalk hover:underline">
                  {t[item.key]}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/cookie-policy" className="hover:text-chalk hover:underline">
                {t.cookiePolicy}
              </Link>
            </li>
            {policies.map((policy) => (
              <li key={policy.key}>
                <Link href={`/policies/${policy.key}`} className="hover:text-chalk hover:underline">
                  {policy.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="mb-4 text-sm font-semibold">{t.getInTouch}</h2>
          <address className="flex flex-col gap-2.5 text-sm not-italic text-chalk/80">
            {settings.phones.map((phone) => (
              <a key={phone.value} href={`tel:${phone.value.replace(/\s/g, "")}`} className="hover:text-chalk">
                {phone.title ? `${phone.title}: ` : ""}
                {phone.value}
              </a>
            ))}
            {settings.emails.map((email) => (
              <a key={email.value} href={`mailto:${email.value}`} className="break-all hover:text-chalk">
                {email.value}
              </a>
            ))}
            <a href={whatsappChatHref(WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-chalk">
              <FaWhatsapp aria-hidden className="size-4" /> {WHATSAPP_NUMBER}
            </a>
            {settings.address ? <span>{settings.address}</span> : null}
          </address>
          <SocialLinks social={settings.social} />
        </div>
      </div>
      <div className="page-gutter border-t border-chalk/15 py-8">
        <FooterPayments title={t.securePayment} />
      </div>
      <div className="border-t border-chalk/15 py-8" aria-hidden>
        <div className="page-gutter">
          <div className="relative isolate aspect-[112/39] overflow-hidden">
            <FooterWeavingArt />
          </div>
        </div>
      </div>
      <div className="border-t border-chalk/15">
        <p className="page-gutter py-5 text-center text-xs text-chalk/60">
          {t.rights(year, settings.currency)}
        </p>
      </div>
    </footer>
  );
}
