"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LuPrinter, LuX } from "react-icons/lu";
import type { OrderResult } from "@/lib/types";
import type { ShopSettings } from "@/lib/shop-api";
import OrderInvoice from "@/components/order-invoice";

/**
 * The customer's invoice on a screen that is not the confirmation page — the
 * admin panel opens it over the order it belongs to. The sheet inside is the
 * very same component the shopper prints after checkout, so there is one
 * invoice design to keep right; this only adds the backdrop and the Print
 * button, and its own print rules so the surrounding page (admin sidebar and
 * all) does not reach the paper.
 */
export default function InvoiceModal({
  order,
  settings,
  open,
  onClose,
}: {
  order: OrderResult;
  settings: ShopSettings | null;
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close on Escape, and hold the page still behind the backdrop.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="invoice-portal">
      {/* Only the sheet goes to paper: everything outside this portal is taken
          out of the print flow, and the backdrop stops being a scrolling
          overlay so the invoice can run onto a second page if it is long. */}
      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          body > *:not(.invoice-portal) { display: none !important; }
          .invoice-portal .invoice-backdrop {
            position: static !important;
            display: block !important;
            overflow: visible !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
          }
          .invoice-portal .invoice-frame {
            max-width: none !important;
            margin: 0 !important;
          }
          .invoice-portal .invoice-toolbar { display: none !important; }
        }
      `}</style>

      <div
        className="invoice-backdrop fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-stone-900/60 p-4 backdrop-blur-sm sm:p-8"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Invoice for order ${order.orderNumber}`}
      >
        <div
          className="invoice-frame relative my-4 w-full max-w-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="invoice-toolbar mb-3 flex items-center justify-between gap-3">
            <span className="font-sans text-sm font-medium uppercase tracking-wider text-white/90">
              Invoice #{order.orderNumber}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-brand px-5 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-brand-dark"
              >
                <LuPrinter className="h-4 w-4" />
                Print
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close invoice"
                className="cursor-pointer rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
              >
                <LuX className="h-4 w-4" />
              </button>
            </div>
          </div>

          <OrderInvoice order={order} settings={settings} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
