import type { Metadata } from "next";
import { Disclosure } from "@/components/storefront/shared/disclosure";
import { getStoreSettings } from "@/lib/storefront/catalog-data";
import { getMessages } from "@/lib/i18n/server";
import { buildFaqs } from "@/utils/storefront/faqs";

export const metadata: Metadata = {
  title: "Questions and answers",
  description: "Sizing, delivery, cash on delivery, returns and exchanges at Rooq.",
};

export default async function FaqPage() {
  const [settings, { locale, t }] = await Promise.all([getStoreSettings(), getMessages()]);
  const faqs = buildFaqs(settings, locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
  };
  return (
    <div className="page-gutter grid gap-10 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:pt-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <h1 className="font-display font-expanded text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none">{t.home.faqTitle}</h1>
      <div className="border-t border-line">
        {faqs.map((faq) => (
          <Disclosure key={faq.question} title={faq.question}>
            <p className="max-w-[64ch]">{faq.answer}</p>
          </Disclosure>
        ))}
      </div>
    </div>
  );
}
