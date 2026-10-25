"use client";

import Image from "next/image";
import type { OrderResult } from "@/lib/types";
import type { ShopSettings } from "@/lib/shop-api";
import { getCurrencySymbol } from "@/lib/currency";
import { SHOP_WEBSITE, resolveShopContact, whatsappHref } from "@/lib/shop-contact";
import { cartTotals, isDiscounted, unitListPrice } from "@/lib/cart-pricing";

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
 * Each part once, in order. Guest checkout stores the delivery zone in both
 * city and state, which printed "Inside Dhaka, Inside Dhaka"; the zone itself
 * is already on the Delivery row, so it is left out of the address too.
 */
function addressParts(parts: (string | undefined)[], omit?: string): string[] {
  const seen = new Set(omit ? [omit.trim().toLowerCase()] : []);
  return parts.flatMap((part) => {
    const value = part?.trim();
    if (!value || seen.has(value.toLowerCase())) return [];
    seen.add(value.toLowerCase());
    return [value];
  });
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

  // Older stored orders carry no `subtotal`/`productDiscount`, so both are
  // recomputed from the lines — which is the same arithmetic that produced
  // them, and correctly yields a zero discount for a line with no offer.
  const lineTotals = cartTotals(
    (order.items ?? []).map((item) => ({
      price: item.price,
      originalPrice: item.originalPrice,
      quantity: item.quantity,
    })),
  );
  const subtotal = order.subtotal ?? lineTotals.listSubtotal;
  /** What the catalogue offers took off — shown per line and as its own row. */
  const productDiscount = Math.max(0, order.productDiscount ?? lineTotals.productDiscount);
  /** What a coupon took off, on top of the product offers. */
  const couponDiscount = Math.max(0, order.discount ?? 0);
  const totalDiscount = productDiscount + couponDiscount;
  // Prefer the charge the API applied; older stored orders only have the gap,
  // which is only a safe guess when nothing was discounted.
  const deliveryCharge =
    order.shippingCost ?? (!totalDiscount && order.total > subtotal ? order.total - subtotal : 0);
  // What the customer actually owes. Falls back to the arithmetic when an older
  // stored order has no total of its own.
  const payable = order.total ?? subtotal - totalDiscount + deliveryCharge;
  const savedPercent =
    subtotal > 0 && totalDiscount > 0 ? Math.round((totalDiscount / subtotal) * 100) : 0;
  const isCod = (order.paymentMethod ?? "cod") === "cod";
  const zoneLabel = order.deliveryZone
    ? ZONE_LABELS[order.deliveryZone] ?? order.deliveryZone
    : undefined;
  const cityLine = addressParts([order.address.city, order.address.state], zoneLabel).join(", ");
  const facebookUrl = settings?.socialContact?.facebook?.trim();

  const details: [string, string][] = [
    ...(order.invoiceNumber ? [["Invoice No.", order.invoiceNumber] as [string, string]] : []),
    ["Order ID", order.orderNumber],
    ["Date", formatDate(order.placedAt)],
    ["Payment", isCod ? "Cash on Delivery" : "Paid online"],
    ...(zoneLabel ? [["Delivery", zoneLabel] as [string, string]] : []),
  ];

  return (
    <div className="invoice-sheet overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-md sm:p-10 print:overflow-visible">
      {/* ── Letterhead ─────────────────────────────────────────────────
          Shop identity on the left, logo on the right; the invoice title and
          its details sit in their own band below, clear of the logo. */}
      <div className="flex items-start justify-between gap-6 border-b-2 border-[#1f2a17] pb-5">
        <div className="min-w-0">
          <p className="font-gotham text-sm font-bold text-[#1f2a17]">{shopName}</p>
          <p className="mt-1 font-gotham text-[11px] leading-relaxed text-stone-500">
            {contact.address}
          </p>
          <p className="font-gotham text-[11px] text-stone-500">{contact.phone}</p>
          <a
            href={SHOP_WEBSITE.href}
            className="font-gotham text-[11px] font-semibold text-[#1f2a17]"
          >
            {SHOP_WEBSITE.label}
          </a>
        </div>
        <Image
          src={settings?.logo || "/assets/Logo-English.png"}
          alt={shopName}
          width={160}
          height={48}
          className="h-12 w-auto max-w-[45%] shrink-0 object-contain"
          unoptimized={Boolean(settings?.logo)}
          priority
        />
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between print:flex-row print:items-start print:justify-between">
        <h2 className="font-display text-2xl font-bold uppercase tracking-[0.2em] text-[#1f2a17]">
          Invoice
        </h2>
        <table>
          <tbody className="font-gotham text-[11px] text-stone-600">
            {details.map(([label, value]) => (
              <tr key={label}>
                <td className="pr-4 text-stone-400">{label}</td>
                <td className="font-semibold text-[#1f2a17] sm:text-right print:text-right">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Bill to / Ship to ──────────────────────────────────────────── */}
      <div className="my-6 grid grid-cols-1 gap-6 sm:grid-cols-2 print:grid-cols-2">
        <div>
          <p className="mb-2 font-gotham text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
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
          <p className="mb-2 font-gotham text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
            Delivery Address
          </p>
          <p className="font-gotham text-xs leading-relaxed text-stone-700">
            {order.address.addressLine1}
            {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ""}
            {(cityLine || order.address.postalCode) && (
              <>
                <br />
                {cityLine}
                {order.address.postalCode
                  ? `${cityLine ? " - " : ""}${order.address.postalCode}`
                  : ""}
              </>
            )}
            <br />
            {order.address.country}
          </p>
        </div>
      </div>

      {/* ── Items ──────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto print:overflow-visible">
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
                <td className="py-3 px-3">
                  <p className="font-semibold text-stone-900">{item.name}</p>
                  {Boolean(item.sku || item.options?.length) && (
                    <p className="mt-0.5 text-[11px] text-stone-500">
                      {[item.sku && `SKU: ${item.sku}`, ...(item.options ?? [])]
                        .filter(Boolean)
                        .join(" | ")}
                    </p>
                  )}
                </td>
                <td className="py-3 px-3 text-center">{item.quantity}</td>
                <td className="py-3 px-3 text-right">
                  {isDiscounted(item) && (
                    <span className="mr-1.5 text-stone-400 line-through">
                      {money(unitListPrice(item))}
                    </span>
                  )}
                  {money(item.price)}
                </td>
                <td className="py-3 px-3 text-right font-semibold text-[#1f2a17]">
                  {money(unitListPrice(item) * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Totals ─────────────────────────────────────────────────────── */}
      <div className="invoice-keep mt-6 flex flex-col items-end">
        <div className="w-full space-y-2 font-gotham text-xs text-stone-700 sm:w-72 print:w-72">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-900">{money(subtotal)}</span>
          </div>
          {productDiscount > 0 && (
            <div className="flex justify-between text-[#2f7d1f]">
              <span>Product Discount</span>
              <span className="font-semibold">-{money(productDiscount)}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-[#2f7d1f]">
              <span>Coupon Discount</span>
              <span className="font-semibold">-{money(couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Delivery Charge</span>
            <span className="font-semibold text-stone-900">
              {deliveryCharge > 0 ? money(deliveryCharge) : "Free"}
            </span>
          </div>
          <div className="flex justify-between border-t-2 border-[#1f2a17] pt-2 text-sm font-bold text-[#1f2a17]">
            {/* Cash on Delivery is on the Payment row, so the total says it once. */}
            <span>{isCod ? "Payable on Delivery" : "Payable Amount"}</span>
            <span>{money(payable)}</span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between rounded bg-brand-mist px-3 py-2 font-semibold text-[#2f7d1f]">
              <span>You saved</span>
              <span>
                {money(totalDiscount)}
                {savedPercent > 0 && ` (${savedPercent}%)`}
              </span>
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
      <div className="invoice-keep mt-8 grid grid-cols-1 gap-6 border-t border-stone-200 pt-5 sm:grid-cols-[1fr_auto] print:grid-cols-[1fr_auto]">
        <div className="font-gotham text-[11px] leading-relaxed text-stone-500">
          <p className="font-semibold text-stone-700">Thank you for shopping with {shopName}.</p>
          <p className="mt-1">
            Please check the seals and quantity before paying the rider. Keep this invoice — a
            return or replacement claim is settled against the invoice number above.
          </p>
          <p className="mt-1">
            Questions? Call {contact.phone} ({contact.hours}), or message us on our{" "}
            {facebookUrl ? (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-stone-700 underline"
              >
                Facebook page
              </a>
            ) : (
              "Facebook page"
            )}{" "}
            or WhatsApp:{" "}
            <a
              href={whatsappHref(contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-stone-700 underline"
            >
              {contact.whatsapp}
            </a>
            .
          </p>
        </div>
        <div className="text-center">
          <div className="h-10 border-b border-dashed border-stone-400 sm:w-40 print:w-40" />
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
