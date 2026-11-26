import type { Metadata } from "next";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { FiArrowRight, FiPhone } from "react-icons/fi";
import { FaqExplorer } from "@/components/storefront/faq/faq-explorer";
import { Breadcrumbs } from "@/components/storefront/shared/breadcrumbs";
import { COPY } from "@/lib/constants/storefront-copy";
import { WHATSAPP_NUMBER, telHref, whatsappChatHref } from "@/lib/shop-contact";
import { getStoreSettings } from "@/lib/storefront/catalog-data";
import { buildFaqs } from "@/utils/storefront/faqs";
import { formatMoney } from "@/utils/storefront/money";

export const metadata: Metadata = {
  title: "Questions and answers",
  description: "Sizing, delivery, cash on delivery, returns, exchanges and handloom care at Rooq.",
};

export default async function FaqPage() {
  const [settings] = await Promise.all([getStoreSettings()]);
  const t = COPY;
  const faqs = buildFaqs(settings);
  const { delivery, currency } = settings;
  const formatCharge = (amount: number) => (amount > 0 ? formatMoney(amount, currency) : t.faq.free);
  const primaryPhone = settings.phones[0]?.value ?? null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <div className="page-gutter flex flex-col gap-10 pt-6 md:gap-12 md:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="flex flex-col gap-5 border-b border-line pb-8 md:pb-10">
        <Breadcrumbs items={[{ label: t.faq.home, href: "/" }, { label: t.faq.title }]} />
        <header className="flex max-w-[62ch] flex-col gap-3">
          <p className="type-label text-dye">{t.faq.eyebrow}</p>
          <h1 className="font-display font-expanded text-[clamp(2rem,6vw,3.5rem)] font-extrabold leading-none">{t.faq.title}</h1>
          <p className="type-lead text-stone">{t.faq.lead}</p>
        </header>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-12">
        <FaqExplorer faqs={faqs} labels={t.faq} />

        <aside className="flex flex-col gap-6 lg:sticky lg:top-28">
          <div className="flex flex-col gap-4 border border-line bg-selvedge/35 p-6">
            <h2 className="type-label text-dye">{t.faq.quickFactsTitle}</h2>
            <dl className="flex flex-col divide-y divide-line text-[0.9375rem]">
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-stone">{t.faq.dhakaDelivery}</dt>
                <dd className="font-medium text-ink">{formatCharge(delivery.inside)}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-stone">{t.faq.nearDhakaDelivery}</dt>
                <dd className="font-medium text-ink">{formatCharge(delivery.nearCity)}</dd>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <dt className="text-stone">{t.faq.outsideDelivery}</dt>
                <dd className="font-medium text-ink">{formatCharge(delivery.outside)}</dd>
              </div>
              {delivery.freeShippingThreshold ? (
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-stone">{t.faq.freeOver}</dt>
                  <dd className="font-medium text-ink">{formatMoney(delivery.freeShippingThreshold, currency)}</dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between pt-2.5">
                <dt className="text-stone">{t.faq.returnWindow}</dt>
                <dd className="font-medium text-ink">{t.faq.days.replace("{days}", String(delivery.returnWindowDays))}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-4 bg-ink p-6 text-chalk">
            <h2 className="type-h2 text-chalk">{t.faq.stillNeedHelp}</h2>
            <p className="text-[0.9375rem] leading-relaxed text-chalk/80">{t.faq.stillNeedHelpBody}</p>
            <div className="mt-1 flex flex-col gap-2.5">
              <Link
                href="/contact"
                className="type-label inline-flex h-11 items-center justify-between bg-chalk px-4 text-ink transition-colors hover:bg-selvedge"
              >
                <span>{t.faq.contactUs}</span>
                <FiArrowRight aria-hidden className="size-4" />
              </Link>
              <a
                href={whatsappChatHref(WHATSAPP_NUMBER)}
                target="_blank"
                rel="noopener noreferrer"
                className="type-label inline-flex h-11 items-center justify-between border border-chalk/30 px-4 text-chalk transition-colors hover:border-chalk hover:bg-chalk/10"
              >
                <span className="inline-flex items-center gap-2">
                  <FaWhatsapp aria-hidden className="size-4" />
                  {t.faq.whatsappUs}
                </span>
                <FiArrowRight aria-hidden className="size-4" />
              </a>
              {primaryPhone ? (
                <a
                  href={telHref(primaryPhone)}
                  className="type-label inline-flex h-11 items-center justify-between border border-chalk/30 px-4 text-chalk transition-colors hover:border-chalk hover:bg-chalk/10"
                >
                  <span className="inline-flex items-center gap-2">
                    <FiPhone aria-hidden className="size-3.5" />
                    {t.faq.callUs} · {primaryPhone}
                  </span>
                  <FiArrowRight aria-hidden className="size-4" />
                </a>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
