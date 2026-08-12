'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiClock, FiTruck } from 'react-icons/fi';
import { toast } from 'sonner';
import ScrollAnimate from '@/components/ui/scroll-animate';
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';
import type { ShopSettings } from '@/lib/shop-api';
import { resolveDeliveryRates, resolveShopContact, telHref } from '@/lib/shop-contact';

export default function ContactView({ settings }: { settings: ShopSettings | null }) {
  // Phone, e-mail, address and opening hours all come from Admin → Settings.
  const contact = resolveShopContact(settings);
  const rates = resolveDeliveryRates(settings);
  const symbol = getCurrencySymbol(settings?.currency);
  const insideCharge = formatCurrency(rates.inside, symbol);
  const outsideCharge = formatCurrency(rates.outside, symbol);
  const mapQuery = encodeURIComponent(contact.address);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    countryCode: '+880',
    phoneNumber: '',
    message: '',
  });

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      console.log('Contact Form Submitted:', formData);
      toast.success('Thank you for contacting Organishi! Your inquiry has been submitted.');
      setFormData({
        firstName: '',
        lastName: '',
        countryCode: '+880',
        phoneNumber: '',
        message: '',
      });
      setSubmitting(false);
    }, 600);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'DO YOU HAVE CASH ON DELIVERY?',
      answer:
        'Yes — cash on delivery is available in all 64 districts of Bangladesh. You pay the rider in cash only after the parcel reaches your hand. You are welcome to open the box at the door and check that the products, quantity and seals are correct before paying. Please keep the exact amount ready, as riders often carry no change.',
    },
    {
      question: 'HOW LONG DOES DELIVERY TAKE?',
      answer:
        'Inside Dhaka, orders usually arrive within 1–3 working days of confirmation. Outside Dhaka, our courier partners — Steadfast, Pathao, RedX and Sundarban — normally deliver within 3–7 working days. During Ramadan, Eid, floods or hartals, courier networks slow down and we will call you if your parcel is running late.',
    },
    {
      question: 'HOW MUCH IS THE DELIVERY CHARGE?',
      answer:
        `The delivery charge is ${insideCharge} inside Dhaka and ${outsideCharge} outside Dhaka. It is added to your order total at checkout and shown before you confirm, so there are no surprises when the rider arrives. The COD amount collected at your door is the product total plus that delivery charge — nothing else.`,
    },
    {
      question: 'WILL SOMEONE CALL ME BEFORE DELIVERY?',
      answer:
        'Yes. For every cash on delivery order our team calls or WhatsApps the number you gave us to confirm your address and the order before we dispatch it. The delivery rider will also call you on the day of delivery, usually from their own mobile number. Please note that we will never ask you for a bKash PIN, an OTP or any verification code over the phone.',
    },
    {
      question: 'CAN I PAY WITH bKASH, NAGAD OR ROCKET?',
      answer:
        `You can. Advance payment through bKash, Nagad or Rocket is available at checkout, and cards are supported where shown. Only send advance payment to the numbers displayed at checkout or confirmed by our team on ${contact.phone}. For large or bulk orders we may ask for a partial advance before dispatch.`,
    },
    {
      question: 'WHERE DO YOUR PRODUCTS COME FROM?',
      answer:
        'Everything we sell is sourced directly from farming families and small producers across Bangladesh — mustard from the fields of Faridpur and Rajshahi, ghee from dairy households, honey from Sundarban and mustard-flower hives, coconut oil from the coastal belt. We buy from the growers ourselves, which is why there is no middleman price on our shelf and why we can tell you exactly where a batch came from.',
    },
    {
      question: 'HOW DO I KNOW THE MUSTARD OIL AND GHEE ARE NOT ADULTERATED?',
      answer:
        'Adulteration is the honest worry every Bangladeshi shopper has, and we treat it that way. Every batch is lab-tested for purity before it is bottled, sealed at our own facility, and marked with a batch and best-before date. Real cold-pressed mustard oil has a sharp pungency that catches your nose, leaves a natural sediment at the bottom, and never looks glass-clear. Pure ghee grains and hardens in winter. If anything ever seems off, send us a photo and we will replace it.',
    },
    {
      question: 'WHY HAS MY HONEY CRYSTALLISED AND MY GHEE GONE HARD?',
      answer:
        'Both are proof that the product is real, not a fault. Raw, unprocessed honey naturally crystallises in cooler weather — place the jar in warm water and it will loosen again. Pure ghee sets solid in winter and turns liquid in Dhaka summer heat. Only processed, additive-heavy versions stay identical all year round.',
    },
    {
      question: 'WHAT IF THE PRODUCT ARRIVES DAMAGED OR WRONG?',
      answer:
        'Tell us within 48 hours of delivery with your order number and a clear photo of the product and the packaging. If the item is wrong, damaged, leaking, broken-sealed or past its best-before date, we replace it free of charge or refund you in full, including the delivery charge. Because these are food items, we cannot accept the return of an opened seal unless the complaint is about quality.',
    },
    {
      question: 'CAN I CANCEL OR CHANGE MY ORDER?',
      answer:
        `Yes, free of charge, any time before the parcel is handed to the courier — just call or WhatsApp ${contact.phone} with your order number. Once it has been dispatched we cannot cancel it online, though you can still refuse it at the door. Please let us know first so we can stop it in transit rather than pay the two-way courier charge.`,
    },
    {
      question: 'DO YOU DELIVER OUTSIDE DHAKA AND OUTSIDE BANGLADESH?',
      answer:
        `We deliver to every district in Bangladesh, from Panchagarh to Teknaf, through our courier partners. International shipping is arranged case by case for bulk and gift orders — email ${contact.email} with the destination country and quantity and we will quote you the freight cost. Customs duties in the destination country are the buyer’s responsibility.`,
    },
    {
      question: 'DO YOU TAKE CORPORATE, WHOLESALE OR EID GIFT ORDERS?',
      answer:
        `We do, and it is a large part of what we ship. We supply offices, resellers and corporate Eid and Puja hampers with custom packaging and branded gift boxes. Wholesale pricing starts at bulk quantities and includes an invoice with your company details. Call ${contact.phone} or use the form above with your quantity and delivery date and our team will get back to you within one working day.`,
    },
  ];

  return (
    <main className="relative w-full bg-[#f4f7ee] pb-12 md:pb-20 overflow-hidden">
      {/* ── Page banner ─────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden mb-12 lg:mb-16">
        <Image
          src="/images/hero/contact-hero.jpg"
          alt="Contact Us"
          fill
          sizes="100vw"
          priority
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[#1f2a17]/60" />

        <div className="mx-auto max-w-[1600px] px-4 py-16 text-center md:px-8 lg:py-20">
          <h1 className="font-display text-[30px] leading-tight text-white md:text-[44px]">
            Contact Us
          </h1>
          <p className="mt-3 text-[14px] text-white/80">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span className="px-2">/</span>
            <span className="text-[#8fd06b]">Contact Us</span>
          </p>
        </div>
      </section>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8">

        {/* COMBINED CONTAINER: Contact Form, Info & Map */}
        <ScrollAnimate variant="fade-in-up">
          <div className="bg-white rounded-2xl shadow-lg border border-[#4a9e2f]/20 overflow-hidden">

            {/* Header */}
            <div className="p-8 sm:p-12 pb-0 text-center">
              <span className="font-gotham text-xs uppercase tracking-[0.25em] text-[#4a9e2f] font-semibold">
                Get in Touch
              </span>
              <h1 className="font-display text-4xl sm:text-5xl text-[#1f2a17] font-bold tracking-tight mt-2">
                Contact <span className="text-[#4a9e2f]">Us</span>
              </h1>
              <p className="font-inter text-stone-600 text-sm tracking-wide mt-3 max-w-xl mx-auto">
                Have a question or looking for wholesale inquiries? Our team is dedicated to providing you with pure organic food and uncompromised quality.
              </p>
            </div>

            {/* CONTAINER 1: Contact Form & Info */}
            <div className="p-8 sm:p-12 md:p-16 pt-8">
              {/* Form and Details Grid */}
              <div className="flex flex-col lg:flex-row justify-start items-start gap-12">

                {/* Left Column (Contact Form) */}
                <div className="flex-1 w-full flex flex-col justify-start items-start gap-8">
                  <div className="flex flex-col justify-start items-start gap-2">
                    <h2 className="text-[#1f2a17] text-2xl font-bold font-display">Send Us a Message</h2>
                    <p className="text-stone-600 text-sm font-inter">
                      Fill out the form below and our customer care team will get back to you within 24 hours.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                    {/* Name fields */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <div className="flex-1 w-full">
                        <label className="block text-[#1f2a17] text-xs font-semibold uppercase tracking-wider font-gotham mb-1.5">First Name</label>
                        <div className="p-3 rounded-lg border border-stone-200 bg-white focus-within:border-[#4a9e2f] focus-within:ring-1 focus-within:ring-[#4a9e2f] transition-all">
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter first name"
                            className="w-full bg-transparent border-0 p-0 text-stone-800 text-sm font-inter placeholder:text-stone-400 focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex-1 w-full">
                        <label className="block text-[#1f2a17] text-xs font-semibold uppercase tracking-wider font-gotham mb-1.5">Last Name</label>
                        <div className="p-3 rounded-lg border border-stone-200 bg-white focus-within:border-[#4a9e2f] focus-within:ring-1 focus-within:ring-[#4a9e2f] transition-all">
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter last name"
                            className="w-full bg-transparent border-0 p-0 text-stone-800 text-sm font-inter placeholder:text-stone-400 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone field */}
                    <div className="w-full">
                      <label className="block text-[#1f2a17] text-xs font-semibold uppercase tracking-wider font-gotham mb-1.5">Phone Number</label>
                      <div className="p-3 rounded-lg border border-stone-200 bg-white flex items-center gap-3 focus-within:border-[#4a9e2f] focus-within:ring-1 focus-within:ring-[#4a9e2f] transition-all">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleInputChange}
                          className="bg-transparent text-stone-800 text-sm font-semibold focus:outline-none cursor-pointer pr-1"
                        >
                          <option value="+880">+880 (BD)</option>
                          <option value="+1">+1 (US)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+91">+91 (IN)</option>
                        </select>
                        <div className="w-px h-4 bg-stone-200"></div>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="Phone Number"
                          className="w-full bg-transparent border-0 p-0 text-stone-800 text-sm font-inter placeholder:text-stone-400 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Message field */}
                    <div className="w-full">
                      <label className="block text-[#1f2a17] text-xs font-semibold uppercase tracking-wider font-gotham mb-1.5">Your Message</label>
                      <div className="p-3 border border-stone-200 bg-white rounded-lg focus-within:border-[#4a9e2f] focus-within:ring-1 focus-within:ring-[#4a9e2f] transition-all">
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Write your query or message here ..."
                          rows={4}
                          className="w-full bg-transparent border-0 p-0 text-stone-800 text-sm font-inter placeholder:text-stone-400 focus:outline-none resize-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-10 py-3.5 bg-[#4a9e2f] hover:bg-[#3d8626] text-white font-gotham text-xs font-bold uppercase tracking-widest rounded-full transition-colors cursor-pointer shadow-md disabled:opacity-50 mt-2 self-start"
                    >
                      {submitting ? 'Submitting...' : 'Submit Message'}
                    </button>
                  </form>
                </div>

                {/* Right Column (Contact Details) */}
                <div className="flex-1 w-full flex flex-col justify-start items-start gap-8 lg:border-l lg:border-stone-100 lg:pl-12">
                  <div className="flex flex-col gap-6">
                    <h2 className="text-[#1f2a17] text-2xl font-bold font-display">Contact & Location</h2>

                    <div className="space-y-4 font-inter text-sm">
                      <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#f4f7ee]/60 border border-[#4a9e2f]/20">
                        <div className="w-9 h-9 rounded-full bg-[#4a9e2f]/10 text-[#4a9e2f] flex items-center justify-center shrink-0 mt-0.5">
                          <FiPhone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1f2a17]">Customer Support</p>
                          {contact.phones.map((entry) => (
                            <a
                              key={entry.value}
                              href={telHref(entry.value)}
                              className="text-stone-700 hover:text-[#4a9e2f] transition-colors block mt-0.5 font-mono"
                            >
                              {entry.value}
                            </a>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#f4f7ee]/60 border border-[#4a9e2f]/20">
                        <div className="w-9 h-9 rounded-full bg-[#4a9e2f]/10 text-[#4a9e2f] flex items-center justify-center shrink-0 mt-0.5">
                          <FiMail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1f2a17]">Email Support</p>
                          {contact.emails.map((entry) => (
                            <a
                              key={entry.value}
                              href={`mailto:${entry.value}`}
                              className="text-stone-700 hover:text-[#4a9e2f] transition-colors block mt-0.5 break-all"
                            >
                              {entry.value}
                            </a>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#f4f7ee]/60 border border-[#4a9e2f]/20">
                        <div className="w-9 h-9 rounded-full bg-[#4a9e2f]/10 text-[#4a9e2f] flex items-center justify-center shrink-0 mt-0.5">
                          <FiMapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1f2a17]">Location</p>
                          <p className="text-stone-600 leading-relaxed mt-0.5">
                            {contact.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#f4f7ee]/60 border border-[#4a9e2f]/20">
                        <div className="w-9 h-9 rounded-full bg-[#4a9e2f]/10 text-[#4a9e2f] flex items-center justify-center shrink-0 mt-0.5">
                          <FiClock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1f2a17]">Opening Hours</p>
                          <p className="text-stone-600 mt-0.5">Open daily: {contact.hours}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#f4f7ee]/60 border border-[#4a9e2f]/20">
                        <div className="w-9 h-9 rounded-full bg-[#4a9e2f]/10 text-[#4a9e2f] flex items-center justify-center shrink-0 mt-0.5">
                          <FiTruck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1f2a17]">Delivery Charge</p>
                          <p className="text-stone-600 mt-0.5">Inside Dhaka: {insideCharge}</p>
                          <p className="text-stone-600 mt-0.5">Outside Dhaka: {outsideCharge}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="w-full overflow-hidden border-t border-stone-100">
              <iframe
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                width="100%"
                height="380"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${settings?.shopName ?? 'Organishi'} — ${contact.address}`}
              ></iframe>
            </div>
          </div>
        </ScrollAnimate>

        {/* CONTAINER 2: FAQ */}
        <ScrollAnimate variant="fade-in-up" delay={150}>
          <div className="p-8 sm:p-12 bg-white rounded-2xl flex flex-col lg:flex-row justify-start items-start gap-10 mt-10 shadow-lg border border-[#4a9e2f]/20">
            <div className="flex-1 w-full flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
              <span className="font-gotham text-xs uppercase tracking-wider text-[#4a9e2f] font-semibold">Support</span>
              <h2 className="text-[#1f2a17] text-3xl font-bold font-display">Frequently Asked Questions</h2>
              <p className="text-stone-600 text-sm font-inter leading-relaxed">
                Cash on delivery, courier timelines outside Dhaka, adulteration worries, crystallised
                honey, wholesale and Eid hampers — these are the questions our customers actually ask.
                Here are the honest answers.
              </p>
              <p className="text-stone-600 text-sm font-inter leading-relaxed">
                Still stuck? Call or WhatsApp{' '}
                <a href={telHref(contact.phone)} className="font-semibold text-[#4a9e2f] hover:underline">
                  {contact.phone}
                </a>{' '}
                — open daily, {contact.hours}.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold font-gotham uppercase tracking-wider text-[#4a9e2f] hover:underline"
                >
                  Explore Organishi Shop &rarr;
                </Link>
                <Link
                  href="/terms-and-conditions"
                  className="inline-flex items-center gap-2 text-xs font-bold font-gotham uppercase tracking-wider text-[#4a9e2f] hover:underline"
                >
                  Terms &amp; Conditions &rarr;
                </Link>
                <Link
                  href="/privacy-policy"
                  className="inline-flex items-center gap-2 text-xs font-bold font-gotham uppercase tracking-wider text-[#4a9e2f] hover:underline"
                >
                  Privacy Policy &rarr;
                </Link>
              </div>
            </div>

            {/* Right Column (Accordions) */}
            <div className="w-full lg:w-[540px] flex flex-col gap-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      isOpen ? 'border-[#4a9e2f] bg-[#f4f7ee]/50' : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between text-left font-gotham text-stone-900 text-sm font-semibold select-none focus:outline-none cursor-pointer"
                    >
                      <span className={isOpen ? 'text-[#4a9e2f]' : ''}>{faq.question}</span>
                      <div className={`w-7 h-7 rounded-full flex justify-center items-center shrink-0 ml-3 transition-colors ${
                        isOpen ? 'bg-[#4a9e2f] text-white' : 'bg-stone-100 text-stone-600'
                      }`}>
                        <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M1 1L5 5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-stone-200/60"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden text-stone-600 text-xs font-inter leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollAnimate>

      </div>
    </main>
  );
}
