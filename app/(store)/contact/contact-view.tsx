'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiArrowRight,
  FiClock,
  FiHeadphones,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import { FaFacebookMessenger, FaWhatsapp } from 'react-icons/fa';
import { PiLeaf } from 'react-icons/pi';
import type { IconType } from 'react-icons';
import { toast } from 'sonner';
import ScrollAnimate from '@/components/ui/scroll-animate';
import SectionHeading from '@/components/storefront/shared/SectionHeading';
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';
import type { ShopSettings } from '@/lib/shop-api';
import {
  messengerHref,
  resolveDeliveryRates,
  resolveShopContact,
  telHref,
  whatsappChatHref,
} from '@/lib/shop-contact';

export default function ContactView({ settings }: { settings: ShopSettings | null }) {
  // Phone, e-mail, address and opening hours all come from Admin → Settings.
  const contact = resolveShopContact(settings);
  const rates = resolveDeliveryRates(settings);
  const symbol = getCurrencySymbol(settings?.currency);
  const insideCharge = formatCurrency(rates.inside, symbol);
  const outsideCharge = formatCurrency(rates.outside, symbol);
  const mapQuery = encodeURIComponent(contact.address);
  // Same split as the footer CTA: first number takes calls, the second WhatsApp.
  const whatsappNumber = contact.phones[1]?.value ?? contact.phone;
  const messenger = messengerHref(settings?.socialContact?.facebook);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+880',
    phoneNumber: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      toast.success('Thank you for contacting Organishi! Your message has been sent successfully.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        countryCode: '+880',
        phoneNumber: '',
        message: '',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const contactCards: ContactCardProps[] = [
    {
      Icon: FiPhone,
      label: 'Hotline',
      value: contact.phone,
      note: 'We are always here to help you',
      href: telHref(contact.phone),
    },
    {
      Icon: FiMail,
      label: 'Email',
      value: contact.email,
      note: 'We reply as soon as possible',
      href: `mailto:${contact.email}`,
    },
    {
      Icon: FiMapPin,
      label: 'Visit Us',
      value: contact.address,
      note: 'Tap to open in Google Maps',
      href: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
      external: true,
      wide: true,
    },
  ];

  // Messenger only appears once Admin → Settings has a Facebook page to chat with.
  const chats: ChatCardProps[] = [
    ...(messenger
      ? [
          {
            Icon: FaFacebookMessenger,
            title: 'Chat on Messenger',
            note: 'Tap to open a live chat',
            href: messenger,
            tone: CHAT_TONES.messenger,
          },
        ]
      : []),
    {
      Icon: FaWhatsapp,
      title: 'Chat on WhatsApp',
      note: 'Tap to start a conversation',
      href: whatsappChatHref(whatsappNumber),
      tone: CHAT_TONES.whatsapp,
    },
  ];

  const promises = [
    { Icon: FiHeadphones, title: 'Dedicated Support', body: 'Our team is ready to assist you anytime.' },
    { Icon: FiShield, title: 'Reliable Service', body: 'We are committed to providing excellent service.' },
    { Icon: PiLeaf, title: 'Customer Satisfaction', body: 'Your satisfaction is our top priority.' },
    { Icon: FiClock, title: 'Business Hours', body: `We are open daily, ${contact.hours}.` },
  ];

  return (
    <main className="space-y-14 pb-14 lg:space-y-20 lg:pb-20">
      {/* ── Intro: heading, artwork, direct lines ───────────────────────────
          Phones read heading → artwork → cards; from lg the artwork moves to
          the right and spans both rows. */}
      <section className="mx-auto max-w-[1600px] px-4 pt-6 md:px-8 md:pt-10">
        <nav aria-label="Breadcrumb" className="mb-5 text-[13px] text-gray-500">
          <Link href="/" className="transition-colors hover:text-brand">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-brand">Contact Us</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-14">
          <SectionHeading
            as="h1"
            title="Contact"
            accent="Us"
            description="We value your feedback and are here to assist you. If you have any questions, concerns or need support, feel free to reach out to our customer service team — we are available to help you during our business hours."
          />

          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-brand-mist lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:aspect-auto lg:min-h-[420px]">
            <Image
              src="/images/hero/contact-hero.jpg"
              alt="Organishi — straight from the farm"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
            <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-[13px] font-semibold text-[#1f2a17] shadow-md">
              <FiClock className="text-brand" size={15} />
              Open daily · {contact.hours}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {contactCards.map((card) => (
              <ContactCard key={card.label} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Live chat ───────────────────────────────────────────────────── */}
      <ScrollAnimate variant="fade-in-up">
        <section className="mx-auto max-w-[1600px] px-4 md:px-8">
          <SectionHeading
            title="Live Chat"
            description="Choose your preferred way to start a conversation with our support team."
          />
          <div
            className={`mt-8 grid gap-5 ${
              chats.length > 1 ? 'md:grid-cols-2 md:gap-7' : 'mx-auto max-w-xl'
            }`}
          >
            {chats.map((chat) => (
              <ChatCard key={chat.title} {...chat} />
            ))}
          </div>
        </section>
      </ScrollAnimate>

      {/* ── Promises ────────────────────────────────────────────────────── */}
      <ScrollAnimate variant="fade-in-up">
        <section className="mx-auto max-w-[1600px] px-4 md:px-8">
          <ul className="grid gap-6 rounded-3xl bg-brand-mist p-6 sm:grid-cols-2 md:p-10 lg:grid-cols-4 lg:gap-8">
            {promises.map(({ Icon, title, body }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <Icon size={22} />
                </span>
                <span>
                  <span className="font-display block text-[16px] font-bold leading-tight text-[#1f2a17] md:text-[18px] md:font-semibold">
                    {title}
                  </span>
                  <span className="mt-1 block text-[14px] leading-relaxed text-gray-600">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </ScrollAnimate>

      {/* ── Message form, map and delivery charges ─────────────────────── */}
      <ScrollAnimate variant="fade-in-up">
        <section className="mx-auto max-w-[1600px] px-4 md:px-8">
          <SectionHeading
            title="Send Us a"
            accent="Message"
            description="Have a question or a wholesale enquiry? Fill out the form and our customer care team will get back to you within 24 hours."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:p-8"
            >
              <div className="flex w-full flex-col gap-4 sm:flex-row">
                <Field label="First Name">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className={INPUT_CLASS}
                    required
                  />
                </Field>
                <Field label="Last Name">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className={INPUT_CLASS}
                    required
                  />
                </Field>
              </div>

              <Field label="Phone Number" inline>
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  className="cursor-pointer bg-transparent pr-1 text-[14px] font-semibold text-stone-800 focus:outline-none"
                >
                  <option value="+880">+880 (BD)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (IN)</option>
                </select>
                <span className="h-4 w-px bg-stone-200" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className={INPUT_CLASS}
                  required
                />
              </Field>

              <Field label="Email Address">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email (optional)"
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Your Message">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your query or message here ..."
                  rows={4}
                  className={`${INPUT_CLASS} resize-none`}
                  required
                />
              </Field>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 h-12 w-full cursor-pointer rounded-full bg-brand px-10 text-[15px] font-semibold text-white shadow-md transition-colors hover:bg-brand-dark disabled:opacity-50 sm:w-auto sm:self-start"
              >
                {submitting ? 'Submitting...' : 'Submit Message'}
              </button>
            </form>

            <div className="flex flex-col gap-6">
              <div className="min-h-[280px] flex-1 overflow-hidden rounded-2xl border border-gray-200">
                <iframe
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 280 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${settings?.shopName ?? 'Organishi'} — ${contact.address}`}
                />
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-mist text-brand">
                  <FiTruck size={22} />
                </span>
                <div className="flex-1">
                  <p className="font-display text-[16px] font-bold text-[#1f2a17] md:text-[18px] md:font-semibold">
                    Delivery Charge
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-[14px]">
                    <p className="rounded-xl bg-brand-mist px-3 py-2">
                      <span className="block text-[12px] text-gray-500">Inside Dhaka</span>
                      <span className="font-semibold text-brand">{insideCharge}</span>
                    </p>
                    <p className="rounded-xl bg-brand-mist px-3 py-2">
                      <span className="block text-[12px] text-gray-500">Outside Dhaka</span>
                      <span className="font-semibold text-brand">{outsideCharge}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimate>

      {/* ── FAQ pointer — the answers live on their own page now. ──────── */}
      <section className="mx-auto max-w-[1600px] px-4 md:px-8">
        <Link
          href="/faq"
          className="flex flex-col items-start gap-4 rounded-3xl bg-brand p-6 text-white transition-colors hover:bg-brand-dark sm:flex-row sm:items-center sm:justify-between md:p-10"
        >
          <span>
            <span className="font-display block text-[22px] font-bold leading-tight md:text-[32px] md:font-semibold">
              Have a question?
            </span>
            <span className="mt-2 block text-[14px] text-white/85">
              Delivery, payment, returns, wholesale — find quick answers in our FAQ.
            </span>
          </span>
          <span className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-brand">
            Read the FAQ <FiArrowRight size={17} />
          </span>
        </Link>
      </section>
    </main>
  );
}

type ContactCardProps = {
  Icon: IconType;
  label: string;
  value: string;
  note: string;
  href: string;
  external?: boolean;
  /** Spans both columns from sm up — the address is too long for half a row. */
  wide?: boolean;
};

function ContactCard({ Icon, label, value, note, href, external, wide }: ContactCardProps) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-brand/40 hover:shadow-md md:p-5 ${
        wide ? 'sm:col-span-2' : ''
      }`}
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-mist text-brand">
        <Icon size={24} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] text-gray-500">{label}</span>
        <span className="font-display block break-words text-[18px] font-bold leading-snug text-brand">
          {value}
        </span>
        <span className="mt-0.5 block text-[13px] text-gray-500">{note}</span>
      </span>
    </a>
  );
}

/**
 * Each chat channel wears its own brand colour. Written out as full class
 * strings because Tailwind only generates classes it can see in the source.
 */
const CHAT_TONES = {
  messenger: {
    soft: 'bg-[#0084FF]/10',
    text: 'text-[#0068c9]',
    icon: 'text-[#0084FF]',
  },
  whatsapp: {
    soft: 'bg-[#25D366]/15',
    text: 'text-[#128C4B]',
    icon: 'text-[#25D366]',
  },
};

type ChatCardProps = {
  Icon: IconType;
  title: string;
  note: string;
  href: string;
  tone: (typeof CHAT_TONES)[keyof typeof CHAT_TONES];
};

function ChatCard({ Icon, title, note, href, tone }: ChatCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-8 text-center shadow-sm transition-shadow hover:shadow-md md:py-10"
    >
      <span aria-hidden className={`absolute -bottom-12 -left-12 h-32 w-32 rounded-full ${tone.soft}`} />
      <span aria-hidden className={`absolute -bottom-10 -right-12 h-28 w-28 rounded-full ${tone.soft}`} />

      <span className={`relative mx-auto flex h-16 w-16 items-center justify-center rounded-full ${tone.soft}`}>
        <Icon size={30} className={tone.icon} />
      </span>
      <span className={`font-display relative mt-4 block text-[20px] font-bold md:text-[24px] md:font-semibold ${tone.text}`}>
        {title}
      </span>
      <span className="relative mt-1 block text-[14px] text-gray-500">{note}</span>
      <span
        className={`relative mx-auto mt-6 inline-flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full text-[15px] font-semibold transition-transform group-hover:scale-[1.02] ${tone.soft} ${tone.text}`}
      >
        Start Chat <FiArrowRight size={17} />
      </span>
    </a>
  );
}

const INPUT_CLASS =
  'w-full border-0 bg-transparent p-0 text-[14px] text-stone-800 placeholder:text-stone-400 focus:outline-none';

function Field({
  label,
  inline,
  children,
}: {
  label: string;
  /** Lays the children out in a row — the country code beside the number. */
  inline?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block w-full flex-1">
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-[#1f2a17]">
        {label}
      </span>
      <span
        className={`block rounded-lg border border-stone-200 bg-white p-3 transition-all focus-within:border-brand focus-within:ring-1 focus-within:ring-brand ${
          inline ? 'flex items-center gap-3' : ''
        }`}
      >
        {children}
      </span>
    </label>
  );
}
