"use client";

import { useEffect, useState } from "react";
import InvoiceModal from "@/components/invoice-modal";
import { orderToInvoice } from "@/utils/orders/invoice";
import { fetchShopSettings, type ShopSettings } from "@/lib/shop-api";
import type { OrderResponse as Order } from "@/types/commerce/order";
import { AdminIcon } from "../../../_components/admin-shell";

/** Prints the same invoice the shopper got; the letterhead is fetched the first time it opens. */
export function OrderInvoiceButton({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<ShopSettings | null>(null);

  useEffect(() => {
    if (!open || settings) return;
    fetchShopSettings()
      .then(setSettings)
      .catch(() => {
        /* the invoice falls back to the packaged logo and contact details */
      });
  }, [open, settings]);

  return (
    <>
      <button
        className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50"
        onClick={() => setOpen(true)}
        type="button"
      >
        <AdminIcon className="h-4 w-4" name="printer" />
        Invoice
      </button>
      <InvoiceModal order={orderToInvoice(order)} settings={settings} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
