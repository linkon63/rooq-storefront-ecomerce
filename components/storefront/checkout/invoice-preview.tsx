"use client";

import { useEffect, useState } from "react";
import OrderInvoice from "@/components/order-invoice";
import { fetchShopSettings, type ShopSettings } from "@/lib/shop-api";
import type { Order } from "@/types/storefront/commerce";
import { storefrontOrderToInvoice } from "@/utils/storefront/order-invoice";

/** On-screen copy of the invoice the PDF button downloads; the letterhead loads with Settings. */
export function InvoicePreview({ order }: { order: Order }) {
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    let live = true;
    void fetchShopSettings().then((next) => {
      if (live) setSettings(next);
    });
    return () => {
      live = false;
    };
  }, []);

  return (
    <section aria-label="Invoice preview" className="min-w-0">
      <OrderInvoice order={storefrontOrderToInvoice(order)} settings={settings} />
    </section>
  );
}
