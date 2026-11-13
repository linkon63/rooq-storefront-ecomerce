import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { FiInfo, FiPackage, FiPhone, FiTruck } from "react-icons/fi";
import { telHref, whatsappChatHref } from "@/lib/shop-contact";

type TopBarProps = {
  phone: string | null;
  whatsapp: string;
  announcement: string | null;
};

const LINKS = [
  { label: "Track order", href: "/profile?tab=orders", Icon: FiPackage },
  { label: "Delivery", href: "/policies/delivery", Icon: FiTruck },
  { label: "About us", href: "/about", Icon: FiInfo },
] as const;

const item = "inline-flex items-center gap-1.5 whitespace-nowrap transition-opacity hover:opacity-70";

/**
 * The thin bar above the header: call and WhatsApp on the left, the
 * announcement in the middle (wide screens), help links on the right.
 */
export function TopBar({ phone, whatsapp, announcement }: TopBarProps) {
  return (
    <div className="bg-ink text-chalk">
      <div className="page-gutter type-label flex h-9 items-center justify-between gap-4 text-[0.6875rem]">
        <div className="flex items-center gap-4">
          {phone ? (
            <a href={telHref(phone)} className={item}>
              <FiPhone aria-hidden className="size-3.5" />
              <span className="hidden sm:inline">{phone}</span>
              <span className="sm:hidden">Call</span>
            </a>
          ) : null}
          <a href={whatsappChatHref(whatsapp)} target="_blank" rel="noopener noreferrer" className={item}>
            <FaWhatsapp aria-hidden className="size-3.5" />
            <span className="hidden sm:inline">WhatsApp {whatsapp}</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
        {announcement ? <p className="hidden truncate text-center text-chalk/85 lg:block">{announcement}</p> : null}
        <nav aria-label="Help" className="flex items-center gap-4">
          {LINKS.map(({ label, href, Icon }, index) => (
            <Link key={href} href={href} className={`${item} ${index === 0 ? "" : "hidden md:inline-flex"}`}>
              <Icon aria-hidden className="size-3.5" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
