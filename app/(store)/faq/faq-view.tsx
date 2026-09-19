"use client";

import { useState } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowRight, FiPhone } from "react-icons/fi";

import SectionHeading from "@/components/storefront/shared/SectionHeading";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import type { ShopSettings } from "@/lib/shop-api";
import {
  resolveDeliveryRates,
  resolveShopContact,
  telHref,
  whatsappChatHref,
} from "@/lib/shop-contact";
import { buildFaqs } from "./faqs";

export default function FaqView({ settings }: { settings: ShopSettings | null }) {
  const contact = resolveShopContact(settings);
  const rates = resolveDeliveryRates(settings);
  const symbol = getCurrencySymbol(settings?.currency);
  // Same split as the footer CTA: first number takes calls, the second WhatsApp.
  const whatsappNumber = contact.phones[1]?.value ?? contact.phone;

  const faqs = buildFaqs({
    phone: contact.phone,
    email: contact.email,
    insideCharge: formatCurrency(rates.inside, symbol),
    outsideCharge: formatCurrency(rates.outside, symbol),
  });

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="pb-14 lg:pb-20">
      <section className="mx-auto max-w-[1600px] px-4 pt-6 md:px-8 md:pt-10">
        <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-gray-500">
          <Link href="/" className="transition-colors hover:text-brand">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-brand">FAQ</span>
        </nav>

        {/* Phones: heading → answers → help card. From lg the heading and help
            card stick in the left column while the answers scroll on the right. */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-14">
          <div className="flex flex-col gap-8 lg:sticky lg:top-36 lg:self-start">
            <SectionHeading
              as="h1"
              title="Frequently Asked"
              accent="Questions"
              description="Cash on delivery, courier timelines outside Dhaka, adulteration worries, crystallised honey, wholesale and Eid hampers — these are the questions our customers actually ask. Here are the honest answers."
            />
            <HelpCard
              phone={contact.phone}
              whatsappNumber={whatsappNumber}
              hours={contact.hours}
              className="hidden lg:block"
            />
          </div>

          <div className="flex w-full flex-col gap-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className={`rounded-xl border p-4 transition-all duration-300 md:p-5 ${
                    isOpen ? "border-brand bg-brand-mist/50" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer select-none items-center justify-between text-left text-[14px] font-semibold text-[#1f2a17] focus:outline-none md:text-[15px]"
                  >
                    <span className={isOpen ? "text-brand" : ""}>{faq.question}</span>
                    <span
                      className={`ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isOpen ? "bg-brand text-white" : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      <svg
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 10 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                      isOpen
                        ? "mt-3 grid-rows-[1fr] border-t border-gray-200/60 pt-3 opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden text-[14px] leading-relaxed text-gray-600">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <HelpCard
            phone={contact.phone}
            whatsappNumber={whatsappNumber}
            hours={contact.hours}
            className="lg:hidden"
          />
        </div>
      </section>
    </main>
  );
}

/** "Still have questions?" — call, WhatsApp, or the contact page. */
function HelpCard({
  phone,
  whatsappNumber,
  hours,
  className = "",
}: {
  phone: string;
  whatsappNumber: string;
  hours: string;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl bg-brand-mist p-6 md:p-8 ${className}`}>
      <p className="font-display text-[18px] font-bold text-[#1f2a17] md:text-[22px] md:font-semibold">
        Still have questions?
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-gray-600">
        Our team is happy to help — open daily, {hours}.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a
          href={telHref(phone)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <FiPhone size={18} /> Call Us
        </a>
        <a
          href={whatsappChatHref(whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] text-[15px] font-semibold text-white"
        >
          <FaWhatsapp size={19} /> WhatsApp
        </a>
      </div>

      <Link
        href="/contact"
        className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand hover:underline"
      >
        More ways to reach us <FiArrowRight size={15} />
      </Link>
    </div>
  );
}
