import { InstallSheet } from "@/components/storefront/mobile/install-sheet";
import { MobileTabBar } from "@/components/storefront/mobile/mobile-tab-bar";
import { HomeStitch } from "@/components/storefront/home/stitch/home-stitch";
import { StoreSync } from "@/app/_providers/store-sync";
import { GoogleTagManagerNoScript, GoogleTagManagerScript } from "@/components/analytics/google-tag-manager";
import { SiteFooter } from "@/components/storefront/shell/site-footer";
import { PwaRegister } from "@/components/storefront/shell/pwa-register";
import { RoutePrefetch } from "@/components/storefront/shell/route-prefetch";
import { FloatingActions } from "@/components/storefront/shell/floating-actions";
import { SiteHeader } from "@/components/storefront/shell/site-header";
import { StoreOverlays } from "@/components/storefront/shell/store-overlays";
import { StoreToaster } from "@/components/storefront/shell/store-toaster";
import { WishlistFlyLayer } from "@/components/storefront/shell/wishlist-fly-layer";
import { COPY } from "@/lib/constants/storefront-copy";
import { telHref, WHATSAPP_NUMBER, whatsappChatHref } from "@/lib/shop-contact";
import { getCategoryTree, getStorePolicies, getStoreSettings } from "@/lib/storefront/catalog-data";
import { buildPrimaryNav } from "@/utils/storefront/nav";
import { announcementFor } from "@/utils/storefront/settings";

/**
 * Storefront chrome. Settings, categories and policies load in parallel and
 * each falls back to an empty value, so a slow API never blanks the shell.
 */
export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const t = COPY;
  const [settings, categories, policies] = await Promise.all([
    getStoreSettings(),
    getCategoryTree(),
    getStorePolicies(),
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
      <div className="storefront-root relative flex min-h-full flex-1 flex-col">
        <SiteHeader
          nav={nav}
          logo={settings.logoUrl}
          announcement={announcement}
          phone={WHATSAPP_NUMBER}
          whatsapp={WHATSAPP_NUMBER}
          t={t}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter nav={nav} settings={settings} policies={policies} t={t.footer} newsletter={t.newsletter} />
        <HomeStitch />
      </div>
      <FloatingActions
        phone={WHATSAPP_NUMBER}
        telHref={telHref(WHATSAPP_NUMBER)}
        whatsappHref={whatsappChatHref(WHATSAPP_NUMBER)}
      />
      <StoreSync currency={settings.currency} />
      <MobileTabBar />
      <InstallSheet t={{ installApp: t.footer.installApp, installHintIos: t.footer.installHintIos }} />
      <StoreOverlays delivery={settings.delivery} />
      <WishlistFlyLayer />
      <StoreToaster />
      <RoutePrefetch />
      <PwaRegister />
    </>
  );
}
