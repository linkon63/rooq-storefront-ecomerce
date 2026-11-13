"use client";

import { InvoiceFooter } from "@/components/invoice/invoice-footer";
import { InvoiceItems } from "@/components/invoice/invoice-items";
import { InvoiceLetterhead } from "@/components/invoice/invoice-letterhead";
import { InvoiceParties } from "@/components/invoice/invoice-parties";
import { InvoiceTotals } from "@/components/invoice/invoice-totals";
import { STORE_NAME } from "@/lib/constants/store";
import { getCurrencySymbol } from "@/lib/currency";
import { FALLBACK_FACEBOOK_URL, resolveShopContact } from "@/lib/shop-contact";
import type { ShopSettings } from "@/lib/shop-api";
import type { OrderResult } from "@/types/storefront/ui";
import { summariseInvoice } from "@/utils/orders/invoice-summary";

/**
 * The invoice the customer prints after checkout — also what the shop keeps in
 * the parcel: shop identity, who it goes to, what is in the box, and what the
 * rider collects. `globals.css` strips the screen chrome when it is printed.
 */
export default function OrderInvoice({ order, settings }: { order: OrderResult; settings: ShopSettings | null }) {
  const contact = resolveShopContact(settings);
  const symbol = getCurrencySymbol(settings?.currency);
  const money = (value: number) => `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const shopName = settings?.shopName ?? STORE_NAME;
  const summary = summariseInvoice(order);

  return (
    <div className="invoice-sheet overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-md sm:p-10 print:overflow-visible">
      <InvoiceLetterhead address={contact.address} details={summary.details} phone={contact.phone} shopName={shopName} />
      <InvoiceParties address={order.address} cityLine={summary.cityLine} />
      <InvoiceItems items={order.items ?? []} money={money} />
      <InvoiceTotals money={money} summary={summary} />
      <InvoiceFooter
        facebookUrl={settings?.socialContact?.facebook?.trim() || FALLBACK_FACEBOOK_URL}
        hours={contact.hours}
        orderNote={order.orderNote}
        phone={contact.phone}
        shopName={shopName}
        whatsapp={contact.whatsapp}
      />
    </div>
  );
}
