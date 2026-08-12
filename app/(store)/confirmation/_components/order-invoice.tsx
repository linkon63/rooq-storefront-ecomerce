"use client";

import Image from "next/image";
import type { OrderResult } from "@/lib/types";
import type { ShopSettings } from "@/lib/shop-api";
import { getCurrencySymbol } from "@/lib/currency";
import { resolveShopContact } from "@/lib/shop-contact";

/** Delivery zone → what the customer should see it called. */
const ZONE_LABELS: Record<string, string> = {
  inside: "Inside Dhaka",
  near_city: "Near Dhaka",
  outside: "Outside Dhaka",
};

function formatDate(value?: string): string {
  const date = value ? new Date(value) : new Date();
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  return safe.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * The invoice the customer prints after checkout — also what the shop keeps in
 * the parcel. It is deliberately one page of plain black-on-white blocks: shop
 * identity, who it goes to, what is in the box, and what the rider collects.
 * The screen version is the same markup; `globals.css` strips the chrome when
 * it goes to paper.
 */
export default function OrderInvoice({
  order,
  settings,
}: {
  order: OrderResult;
  settings: ShopSettings | null;
}) {
  const contact = resolveShopContact(settings);
  const symbol = getCurrencySymbol(settings?.currency);
  const money = (value: number) =>
    `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const shopName = settings?.shopName ?? "Organishi";
  const subtotal =
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? order.total;
  // Prefer the charge the API applied; older stored orders only have the gap.
  const deliveryCharge = order.shippingCost ?? (order.total > subtotal ? order.total - subtotal : 0);
  const isCod = (order.paymentMethod ?? "cod") === "cod";

  return (
    <div className="invoice-sheet overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-md sm:p-10">
      {/* ── Letterhead ─────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-6 border-b-2 border-[#1f2a17] pb-6 sm:flex-row">
        <div className="flex-1">
          {settings?.logo ? (
            <Image
              src={settings.logo}
              alt={shopName}
              width={160}
              height={48}
              className="mb-3 h-10 w-auto object-contain"
              unoptimized
            />
          ) : (
            <Image
              src="/assets/Logo-English.png"
              alt={shopName}
              width={150}
              height={48}
              className="mb-3 h-10 w-auto object-contain"
              priority
            />
          )}
          <p className="font-gotham text-xs font-semibold text-[#1f2a17]">{shopName}</p>
          <p className="mt-0.5 font-gotham text-[11px] leading-relaxed text-stone-500">
            {contact.address}
          </p>
          <p className="font-gotham text-[11px] text-stone-500">
            {contact.phone} · {contact.email}
          </p>
        </div>

        <div className="sm:text-right">
          <h2 className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-[#1f2a17]">
            Invoice
          </h2>
          <table className="mt-2 sm:ml-auto">
            <tbody className="font-gotham text-[11px] text-stone-600">
              <tr>
                <td className="pr-3 text-stone-400">Invoice No.</td>
                <td className="font-semibold text-[#1f2a17]">#{order.orderNumber}</td>
              </tr>
              <tr>
                <td className="pr-3 text-stone-400">Date</td>
                <td className="font-semibold text-[#1f2a17]">{formatDate(order.placedAt)}</td>
              </tr>
              <tr>
                <td className="pr-3 text-stone-400">Payment</td>
                <td className="font-semibold text-[#1f2a17]">
                  {isCod ? "Cash on Delivery" : "Paid online"}
                </td>
              </tr>
              {order.deliveryZone && (
                <tr>
                  <td className="pr-3 text-stone-400">Delivery</td>
                  <td className="font-semibold text-[#1f2a17]">
                    {ZONE_LABELS[order.deliveryZone] ?? order.deliveryZone}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bill to / Ship to ──────────────────────────────────────────── */}
      <div className="my-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 font-gotham text-[10px] font-bold uppercase tracking-[0.18em] text-[#4a9e2f]">
            Billed To
          </p>
          <p className="font-gotham text-sm font-semibold text-stone-800">
            {order.address.fullName}
          </p>
          <p className="mt-1 font-gotham text-xs text-stone-600">{order.address.phone}</p>
          {order.address.email && (
            <p className="font-gotham text-xs text-stone-600">{order.address.email}</p>
          )}
        </div>

        <div>
          <p className="mb-2 font-gotham text-[10px] font-bold uppercase tracking-[0.18em] text-[#4a9e2f]">
            Delivery Address
          </p>
          <p className="font-gotham text-xs leading-relaxed text-stone-700">
            {order.address.addressLine1}
            {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ""}
            <br />
            {[order.address.city, order.address.state].filter(Boolean).join(", ")}
            {order.address.postalCode ? ` - ${order.address.postalCode}` : ""}
            <br />
            {order.address.country}
          </p>
        </div>
      </div>

      {/* ── Items ──────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-y border-stone-300 bg-stone-50 font-gotham text-[10px] font-bold uppercase tracking-[0.12em] text-[#1f2a17]">
              <th className="w-10 py-2.5 px-3 text-center">#</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-gotham text-xs text-stone-800">
            {order.items?.map((item, index) => (
              <tr key={`${item.name}-${index}`}>
                <td className="py-3 px-3 text-center text-stone-400">{index + 1}</td>
                <td className="py-3 px-3 font-semibold text-stone-900">{item.name}</td>
                <td className="py-3 px-3 text-center">{item.quantity}</td>
                <td className="py-3 px-3 text-right">{money(item.price)}</td>
                <td className="py-3 px-3 text-right font-semibold text-[#1f2a17]">
                  {money(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Totals ─────────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-col items-end">
        <div className="w-full space-y-2 font-gotham text-xs text-stone-700 sm:w-72">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-900">{money(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Charge</span>
            <span className="font-semibold text-stone-900">
              {deliveryCharge > 0 ? money(deliveryCharge) : "Free"}
            </span>
          </div>
          <div className="flex justify-between border-t-2 border-[#1f2a17] pt-2 text-sm font-bold text-[#1f2a17]">
            <span>Grand Total</span>
            <span>{money(order.total)}</span>
          </div>
          {isCod && (
            <div className="flex justify-between rounded bg-[#f4f7ee] px-3 py-2 text-xs font-bold text-[#1f2a17]">
              <span>Payable on delivery</span>
              <span>{money(order.total)}</span>
            </div>
          )}
        </div>
      </div>

      {order.orderNote && (
        <div className="mt-6 border-t border-stone-200 pt-4">
          <p className="font-gotham text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
            Order Note
          </p>
          <p className="mt-1 font-gotham text-xs text-stone-600">{order.orderNote}</p>
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-1 gap-6 border-t border-stone-200 pt-5 sm:grid-cols-[1fr_auto]">
        <div className="font-gotham text-[11px] leading-relaxed text-stone-500">
          <p className="font-semibold text-stone-700">Thank you for shopping with {shopName}.</p>
          <p className="mt-1">
            Please check the seals and quantity before paying the rider. Keep this invoice — a
            return or replacement claim is settled against the invoice number above.
          </p>
          <p className="mt-1">
            Questions? Call {contact.phone} ({contact.hours}) or email {contact.email}.
          </p>
        </div>
        <div className="text-center">
          <div className="h-10 border-b border-dashed border-stone-400 sm:w-40" />
          <p className="mt-1.5 font-gotham text-[10px] uppercase tracking-wider text-stone-400">
            Authorised Signature
          </p>
        </div>
      </div>

      <p className="mt-6 text-center font-gotham text-[10px] text-stone-400">
        This is a computer-generated invoice and is valid without a signature.
      </p>
    </div>
  );
}
