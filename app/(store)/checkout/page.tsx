import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutView } from "@/components/storefront/checkout/checkout-view";
import { getStoreSettings } from "@/lib/storefront/catalog-data";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  return (
    <div className="page-gutter pt-4 md:pt-12">
      <h1 className="max-md:pt-4 max-md:!mb-4 mb-8 font-display font-expanded text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none">Checkout</h1>
      <Suspense fallback={null}>
        <CheckoutView delivery={settings.delivery} />
      </Suspense>
    </div>
  );
}
