import type { Metadata } from "next";

import { fetchShopSettings } from "@/lib/shop-api";
import FaqView from "./faq-view";

export const metadata: Metadata = {
  title: "FAQ | Organishi",
  description:
    "Answers on cash on delivery, delivery times and charges, payment, product purity, returns and wholesale orders at Organishi.",
};

/**
 * Answers quote the admin-managed phone, e-mail and delivery charges, so the
 * settings row is fetched on the server — the same source the contact page uses.
 */
export default async function FaqPage() {
  const settings = await fetchShopSettings();
  return <FaqView settings={settings} />;
}
