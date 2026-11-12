import type { Metadata } from "next";
import { CartPageView } from "@/components/storefront/cart/cart-page-view";
import { RecentlyViewedRail } from "@/components/storefront/product-card/recently-viewed-rail";
import { getStoreSettings } from "@/lib/storefront/catalog-data";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default async function CartPage() {
  const settings = await getStoreSettings();
  return (
    <div className="flex flex-col gap-20">
      <div className="page-gutter pt-8 md:pt-12">
        <h1 className="mb-8 font-display font-expanded text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none">Your bag</h1>
        <CartPageView delivery={settings.delivery} />
      </div>
      <RecentlyViewedRail />
    </div>
  );
}
