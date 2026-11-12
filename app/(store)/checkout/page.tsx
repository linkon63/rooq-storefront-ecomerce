import type { Metadata } from "next";
import { CheckoutView } from "@/components/storefront/checkout/checkout-view";
import { getStoreSettings } from "@/lib/storefront/catalog-data";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  return (
    <div className="page-gutter pt-8 md:pt-12">
      <h1 className="mb-8 font-display font-expanded text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none">Checkout</h1>
      <CheckoutView delivery={settings.delivery} />
    </div>
  );
}
