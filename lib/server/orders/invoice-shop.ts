import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getStoreSettings } from "@/lib/storefront/catalog-data";
import { FALLBACK_ADDRESS, FALLBACK_FACEBOOK_URL, SHOP_WEBSITE, WHATSAPP_NUMBER } from "@/lib/shop-contact";
import type { InvoiceShop } from "@/types/commerce/invoice";

/** The storefront header's logo (kechi mark), so the invoice carries the same brand. */
const HEADER_LOGO = path.join(process.cwd(), "public", "images", "logo-kechi-clear.png");

/** Letterhead and contact lines for the invoice, from Admin → Settings. */
export async function loadInvoiceShop(): Promise<InvoiceShop> {
  const settings = await getStoreSettings();
  return {
    name: settings.shopName,
    address: settings.address ?? FALLBACK_ADDRESS,
    phone: settings.phones[0]?.value ?? null,
    email: settings.emails[0]?.value ?? null,
    whatsapp: WHATSAPP_NUMBER,
    website: SHOP_WEBSITE,
    facebookUrl: settings.social.facebook?.trim() || FALLBACK_FACEBOOK_URL,
    logo: await readFile(HEADER_LOGO).catch(() => null),
  };
}
