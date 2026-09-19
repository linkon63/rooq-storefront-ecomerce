/**
 * Where the storefront gets its shop details.
 *
 * Phone numbers, e-mail addresses, the address, the opening hours and the
 * footer blurb are all admin-managed (Settings → General / Contact / Branch).
 * The constants below are only what a page prints while that settings row is
 * still empty — every screen resolves through `resolveShopContact` so a change
 * in the admin panel lands everywhere at once.
 */

import { formatOpeningHours } from "./business-hours";
import { contactEntries, type ShopContactEntry, type ShopSettings } from "./shop-api";

export const FALLBACK_PHONES: ShopContactEntry[] = [
  { title: "Customer Support", value: "+8801629377644" },
];
export const FALLBACK_EMAILS: ShopContactEntry[] = [
  { title: "Support", value: "Organishi.bd@gmail.com" },
];
export const FALLBACK_ADDRESS = "Sector 10, Uttara, Dhaka, Bangladesh";
export const FALLBACK_HOURS = "8:00 AM – 10:00 PM";
export const FALLBACK_FOOTER_DESCRIPTION =
  "Nature has always known what’s best for us. Organishi brings that goodness closer to you with thoughtfully selected, natural and wholesome foods you can trust. We believe healthy living doesn’t have to be complicated—it starts with simple, better choices, every day.";

export type ShopContact = {
  phones: ShopContactEntry[];
  emails: ShopContactEntry[];
  /** First phone / e-mail — the one a header or a call-to-action prints. */
  phone: string;
  email: string;
  address: string;
  /** "8:00 AM – 10:00 PM". */
  hours: string;
  footerDescription: string;
};

/** Local numbers are shown as typed but must dial in international form. */
export function telHref(number: string): string {
  const digits = number.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.startsWith("0")) return `tel:+880${digits.slice(1)}`;
  return `tel:${digits}`;
}

/** wa.me wants bare international digits — no plus, no spaces. */
export function whatsappHref(number: string): string {
  const digits = number.replace(/\D/g, "");
  const international = digits.startsWith("0") ? `880${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

/** Pre-filled WhatsApp text so a shopper only has to hit send to ask their question. */
export const WHATSAPP_ENQUIRY_MESSAGE =
  "আসসালামু আলাইকুম, আমি Organishi-এর পণ্য সম্পর্কে জানতে চাই।";

/** WhatsApp chat link with the enquiry message already typed in. */
export function whatsappChatHref(number: string): string {
  return `${whatsappHref(number)}?text=${encodeURIComponent(WHATSAPP_ENQUIRY_MESSAGE)}`;
}

/**
 * Messenger chat link for the shop's Facebook page, or null when the admin
 * has not set one. m.me takes the page's username, or its numeric id for
 * pages still on `profile.php?id=…`.
 */
export function messengerHref(facebookUrl?: string | null): string | null {
  if (!facebookUrl?.trim()) return null;
  try {
    const url = new URL(facebookUrl.trim().replace(/^(?!https?:\/\/)/, "https://"));
    const id = url.searchParams.get("id");
    const slug = url.pathname.split("/").filter(Boolean)[0];
    const handle = slug === "profile.php" ? id : slug;
    return handle ? `https://m.me/${handle}` : null;
  } catch {
    return null;
  }
}

/** Delivery charges per zone — Admin → Settings → General. */
export const FALLBACK_DELIVERY_RATES = { inside: 80, nearCity: 120, outside: 150 };

export type DeliveryRates = typeof FALLBACK_DELIVERY_RATES;

export function resolveDeliveryRates(settings?: ShopSettings | null): DeliveryRates {
  const rate = (value: unknown, fallback: number) => {
    const parsed = Number(value ?? NaN);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  return {
    inside: rate(settings?.deliveryChargeInside, FALLBACK_DELIVERY_RATES.inside),
    nearCity: rate(settings?.deliveryChargeNearCity, FALLBACK_DELIVERY_RATES.nearCity),
    outside: rate(settings?.deliveryChargeOutside, FALLBACK_DELIVERY_RATES.outside),
  };
}

export function resolveShopContact(settings?: ShopSettings | null): ShopContact {
  const apiPhones = contactEntries(settings?.contactNumber);
  const apiEmails = contactEntries(settings?.email);

  const phones = apiPhones.length ? apiPhones : FALLBACK_PHONES;
  const emails = apiEmails.length ? apiEmails : FALLBACK_EMAILS;

  return {
    phones,
    emails,
    phone: phones[0].value,
    email: emails[0].value,
    address: settings?.branchAddress?.trim() || FALLBACK_ADDRESS,
    hours: formatOpeningHours(settings?.openingTime, settings?.closingTime) ?? FALLBACK_HOURS,
    footerDescription: settings?.footerDescription?.trim() || FALLBACK_FOOTER_DESCRIPTION,
  };
}
