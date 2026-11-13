import { HomeStitch } from "@/components/storefront/home/stitch/home-stitch";
import { StoreSync } from "@/app/_providers/store-sync";
import { GoogleTagManagerNoScript, GoogleTagManagerScript } from "@/components/analytics/google-tag-manager";
import { SiteFooter } from "@/components/storefront/shell/site-footer";
import { FloatingActions } from "@/components/storefront/shell/floating-actions";
import { SiteHeader } from "@/components/storefront/shell/site-header";
import { StoreOverlays } from "@/components/storefront/shell/store-overlays";
import { StoreToaster } from "@/components/storefront/shell/store-toaster";
import { getMessages } from "@/lib/i18n/server";
import { WHATSAPP_NUMBER } from "@/lib/shop-contact";
import { getCategoryTree, getStorePolicies, getStoreSettings } from "@/lib/storefront/catalog-data";
import { buildPrimaryNav } from "@/utils/storefront/nav";
import { announcementFor } from "@/utils/storefront/settings";

/**
 * Storefront chrome. Settings, categories and policies load in parallel and
 * each falls back to an empty value, so a slow API never blanks the shell.
 */
export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, categories, policies, { locale, t }] = await Promise.all([
    getStoreSettings(),
    getCategoryTree(),
    getStorePolicies(),
    getMessages(),
  ]);
  const announcement = announcementFor(
    settings.delivery.freeShippingThreshold,
    settings.delivery.returnWindowDays,
    settings.currency,
  );

  const staticNav: Record<string, string> = { "/shop": t.nav.shop, "/new": t.nav.newIn, "/sale": t.nav.sale };
  const nav = buildPrimaryNav(categories).map((item) => ({ ...item, label: staticNav[item.href] ?? item.label }));

  return (
    <>
      <GoogleTagManagerNoScript />
      <GoogleTagManagerScript />
      <div lang={locale} className="storefront-root relative flex min-h-full flex-1 flex-col">
        <SiteHeader
          nav={nav}
          categories={categories}
          announcement={announcement}
          phone={settings.phones[0]?.value ?? null}
          whatsapp={WHATSAPP_NUMBER}
          locale={locale}
          t={t}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter nav={nav} settings={settings} policies={policies} t={t.footer} newsletter={t.newsletter} />
        <HomeStitch />
      </div>
      <FloatingActions phone={settings.phones[0]?.value ?? null} shopName={settings.shopName} />
      <StoreSync currency={settings.currency} />
      <StoreOverlays delivery={settings.delivery} />
      <StoreToaster />
    </>
  );
}
