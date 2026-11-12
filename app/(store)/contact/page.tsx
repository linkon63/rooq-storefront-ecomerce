import type { Metadata } from "next";
import { ContactForm } from "@/components/storefront/contact/contact-form";
import { getStoreSettings } from "@/lib/storefront/catalog-data";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about sizing, an order or a return? Get in touch with Rooq.",
};

export default async function ContactPage() {
  const settings = await getStoreSettings();
  const hours = settings.openingTime && settings.closingTime ? `${settings.openingTime} to ${settings.closingTime}` : null;
  return (
    <div className="page-gutter grid gap-12 pt-8 md:grid-cols-2 md:pt-12">
      <div className="flex flex-col gap-6">
        <h1 className="font-display font-expanded text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none">Contact us</h1>
        <p className="max-w-[44ch] text-stone">Sizing question, an order that has not arrived, or a return? Write to us and we will reply within a working day.</p>
        <address className="flex flex-col gap-2 not-italic">
          {settings.phones.map((phone) => (
            <a key={phone.value} href={`tel:${phone.value.replace(/\s/g, "")}`} className="font-semibold hover:underline">
              {phone.title ? `${phone.title}: ` : ""}
              {phone.value}
            </a>
          ))}
          {settings.emails.map((email) => (
            <a key={email.value} href={`mailto:${email.value}`} className="font-semibold hover:underline">
              {email.value}
            </a>
          ))}
          {settings.address ? <span className="text-stone">{settings.address}</span> : null}
          {hours ? <span className="text-stone">Open daily, {hours}</span> : null}
        </address>
      </div>
      <ContactForm />
    </div>
  );
}
