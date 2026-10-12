"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuPrinter, LuCircleCheck, LuShoppingBag } from "react-icons/lu";
import type { OrderResult } from "@/lib/types";
import { fetchShopSettings, type ShopSettings } from "@/lib/shop-api";
import { resolveShopContact } from "@/lib/shop-contact";
import OrderInvoice from "@/components/order-invoice";

export default function ConfirmationPage() {
  const [order] = useState<OrderResult | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("orderResult");
    if (stored) {
      try {
        return JSON.parse(stored) as OrderResult;
      } catch {
        return null;
      }
    }
    return null;
  });

  // Shop identity and support details for the invoice — admin-managed.
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  useEffect(() => {
    fetchShopSettings().then(setSettings).catch(() => {});
  }, []);
  const contact = resolveShopContact(settings);

  if (!order) {
    return (
      <main className="grow bg-brand-mist w-full min-h-screen flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-stone-200 max-w-md">
          <p className="text-stone-600 font-gotham text-base mb-6">No recent order details found.</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand text-white font-gotham text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-brand-dark transition-colors"
          >
            <LuShoppingBag className="w-4 h-4" />
            Go To Shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="grow bg-[#f4f4f4] w-full min-h-screen py-10 px-4 sm:px-6 print:bg-white print:py-0 print:px-0">
      <div className="max-w-3xl mx-auto">

        {/* Top Success Card — screen only */}
        <div className="no-print bg-white rounded-2xl p-6 sm:p-8 mb-6 shadow-sm border border-stone-200 text-center">
          <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
            <LuCircleCheck className="w-10 h-10" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-[#1f2a17] font-bold mb-2">
            Thank You For Your Order!
          </h1>
          <p className="font-gotham text-stone-600 text-sm max-w-lg mx-auto">
            Your order <span className="font-bold text-[#1f2a17]">#{order.orderNumber}</span> has been
            confirmed. We will call {order.address.phone} to confirm before dispatch — the invoice
            below is yours to keep.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-6 py-3 bg-white border border-brand text-brand hover:bg-brand hover:text-white font-gotham text-xs font-bold uppercase tracking-wider rounded-full transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <LuPrinter className="w-4 h-4" />
              Print Invoice
            </button>
            <Link
              href="/shop"
              className="px-6 py-3 bg-brand hover:bg-brand-dark text-white font-gotham text-xs font-bold uppercase tracking-wider rounded-full transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <LuShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* The invoice itself — this is what prints */}
        <OrderInvoice order={order} settings={settings} />

        <p className="no-print mt-6 text-center font-gotham text-xs text-stone-400">
          Need help with this order? Contact {contact.email} or call {contact.phone}.
        </p>
      </div>
    </main>
  );
}
