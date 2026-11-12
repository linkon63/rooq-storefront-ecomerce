import { StoreSync } from "@/app/_providers/store-sync";
import { GoogleTagManagerNoScript, GoogleTagManagerScript } from "@/components/analytics/google-tag-manager";
import { SiteFooter } from "@/components/storefront/shell/site-footer";
import { SiteHeader } from "@/components/storefront/shell/site-header";
import { StoreOverlays } from "@/components/storefront/shell/store-overlays";
import { StoreToaster } from "@/components/storefront/shell/store-toaster";
import { getCategoryTree, getStorePolicies, getStoreSettings } from "@/lib/storefront/catalog-data";
import { announcementFor } from "@/utils/storefront/settings";

/**
 * Storefront chrome. Settings, categories and policies load in parallel and
 * each falls back to an empty value, so a slow API never blanks the shell.
 */
export default async function StoreLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, categories, policies] = await Promise.all([getStoreSettings(), getCategoryTree(), getStorePolicies()]);
  const announcement = announcementFor(
    settings.delivery.freeShippingThreshold,
    settings.delivery.returnWindowDays,
    settings.currency,
  );

  return (
    <>
      <GoogleTagManagerNoScript />
      <GoogleTagManagerScript />
      <div className="storefront-root flex min-h-full flex-1 flex-col">
        <SiteHeader categories={categories} announcement={announcement} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter settings={settings} policies={policies} />
      </div>
      <StoreSync currency={settings.currency} />
      <StoreOverlays delivery={settings.delivery} />
      <StoreToaster />
    </>
  );
}
