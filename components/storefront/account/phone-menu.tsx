import { COPY } from "@/lib/constants/storefront-copy";
import { telHref, WHATSAPP_NUMBER, whatsappChatHref } from "@/lib/shop-contact";
import { getStorePolicies } from "@/lib/storefront/catalog-data";
import { InstallAppButton } from "../shell/install-app-button";
import { MenuRow } from "./menu-row";

const contactButton = "press flex h-12 items-center justify-center rounded border border-ink text-sm font-semibold";

/** The links a phone has no header or footer for. */
export async function PhoneMenu() {
  const t = COPY;
  const policies = await getStorePolicies();
  const links = [
    { href: "/compare", label: t.mobileNav.compare },
    { href: "/collections", label: t.home.collections },
    { href: "/customer-gallery", label: t.footer.customerGallery },
    { href: "/faq", label: t.footer.faq },
    { href: "/contact", label: t.footer.contactUs },
    { href: "/about", label: t.footer.aboutUs },
    { href: "/cookie-policy", label: t.footer.cookiePolicy },
    ...policies.map((policy) => ({ href: `/policies/${policy.key}`, label: policy.title })),
  ];
  return (
    <div className="flex flex-col gap-5">
      <ul className="divide-y divide-selvedge border-y border-selvedge">
        {links.map((link) => (
          <MenuRow key={link.href} {...link} />
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-2">
        <a href={telHref(WHATSAPP_NUMBER)} className={contactButton}>
          {t.topBar.call}
        </a>
        <a href={whatsappChatHref(WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer" className={contactButton}>
          WhatsApp
        </a>
      </div>
      <div className="rounded bg-ink p-4 text-chalk empty:hidden">
        <InstallAppButton label={t.footer.installApp} hintIos={t.footer.installHintIos} hintOther={t.footer.installHintOther} />
      </div>
    </div>
  );
}
