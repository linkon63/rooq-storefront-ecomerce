import { fetchShopSettings } from "@/lib/shop-api";
import ContactView from "./contact-view";

/**
 * Contact details, opening hours and delivery charges are admin-managed, so
 * the row is fetched on the server and handed to the client view — the same
 * source the header and footer read from.
 */
export default async function ContactPage() {
  const settings = await fetchShopSettings();
  return <ContactView settings={settings} />;
}
