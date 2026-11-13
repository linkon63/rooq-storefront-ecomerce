import type { StoreSettings } from "@/types/storefront/content";
import { ContactForm } from "../contact/contact-form";

/** Contact block at the foot of the home page: how to reach us, and the form. */
export function HomeContact({ settings }: { settings: StoreSettings }) {
  return (
    <section aria-labelledby="contact-title" className="page-gutter grid gap-10 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <h2 id="contact-title" className="type-h2">
          Contact us
        </h2>
        <p className="type-lead max-w-[44ch] text-stone">
          A question about a saree, an order or a delivery? Send us a message and we will reply within a working day.
        </p>
        <address className="type-body flex flex-col gap-1 not-italic">
          {settings.phones.map((phone) => (
            <a key={phone.value} href={`tel:${phone.value.replace(/\s/g, "")}`} className="hover:underline">
              {phone.value}
            </a>
          ))}
          {settings.emails.map((email) => (
            <a key={email.value} href={`mailto:${email.value}`} className="hover:underline">
              {email.value}
            </a>
          ))}
        </address>
      </div>
      <ContactForm />
    </section>
  );
}
