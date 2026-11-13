import Link from "next/link";
import { LanguageSwitch } from "./language-switch";
import { FaWhatsapp } from "react-icons/fa6";
import { FiInfo, FiPackage, FiPhone, FiTruck } from "react-icons/fi";
import type { Locale } from "@/lib/i18n/locales";
import type { Messages } from "@/lib/i18n/messages";
import { telHref, whatsappChatHref } from "@/lib/shop-contact";

type TopBarProps = {
  phone: string | null;
  whatsapp: string;
  announcement: string | null;
  locale: Locale;
  t: Messages;
};

const LINKS = [
  { key: "trackOrder", href: "/profile?tab=orders", Icon: FiPackage },
  { key: "delivery", href: "/policies/delivery", Icon: FiTruck },
  { key: "aboutUs", href: "/about", Icon: FiInfo },
] as const;

const item = "inline-flex items-center gap-1.5 whitespace-nowrap transition-opacity hover:opacity-70";

/**
 * The thin bar above the header: call and WhatsApp on the left, the
 * announcement in the middle (wide screens), help links on the right.
 */
export function TopBar({ phone, whatsapp, announcement, locale, t }: TopBarProps) {
  return (
    <div className="bg-ink text-chalk">
      <div className="page-gutter type-label flex h-9 items-center justify-between gap-4 text-[0.6875rem]">
        <div className="flex items-center gap-4">
          {phone ? (
            <a href={telHref(phone)} className={item}>
              <FiPhone aria-hidden className="size-3.5" />
              <span className="hidden sm:inline">{phone}</span>
              <span className="sm:hidden">{t.topBar.call}</span>
            </a>
          ) : null}
          <a href={whatsappChatHref(whatsapp)} target="_blank" rel="noopener noreferrer" className={item}>
            <FaWhatsapp aria-hidden className="size-3.5" />
            <span className="hidden sm:inline">WhatsApp {whatsapp}</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
        {announcement ? <p className="hidden truncate text-center text-chalk/85 lg:block">{announcement}</p> : null}
        <nav aria-label={t.topBar.help} className="flex items-center gap-4">
          {LINKS.map(({ key, href, Icon }, index) => (
            <Link key={href} href={href} className={`${item} ${index === 0 ? "" : "hidden md:inline-flex"}`}>
              <Icon aria-hidden className="size-3.5" />
              {t.topBar[key]}
            </Link>
          ))}
          <LanguageSwitch locale={locale} labels={t.language} />
        </nav>
      </div>
    </div>
  );
}
