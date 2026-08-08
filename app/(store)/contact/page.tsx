'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { toast } from 'sonner';
import ScrollAnimate from '@/components/ui/scroll-animate';

export default function ContactPage() {
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
      question: 'WHERE DO YOUR PRODUCTS COME FROM?',
      answer: 'Organishi sources premium organic food directly from local farmers across Bangladesh. The collection includes cold-pressed mustard oil, virgin coconut oil, hand-churned ghee, raw honey, and organic snacks.',
    },
    {
      question: 'DO YOU OFFER INTERNATIONAL SHIPPING?',
      answer: 'Yes, we ship our premium organic collections globally. Delivery times and shipping rates vary depending on the destination country. Custom duties and taxes may apply upon arrival.',
    },
    {
      question: 'HOW LONG DOES DELIVERY TAKE?',
      answer: 'We offer nationwide delivery across Bangladesh. Within Dhaka, estimated delivery is within 2–4 business days. Outside Dhaka, estimated delivery is within 3–7 business days.',
    },
    {
      question: 'ARE YOUR PRODUCTS ETHICALLY SOURCED?',
      answer: 'Absolutely. Ethical sourcing is at the core of our brand values. We work directly with local Bangladeshi farmers and growers who prioritize fair wages, safe working conditions, and sustainable farming methods.',
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
                          <p className="font-semibold text-[#1f2a17]">Phone & WhatsApp</p>
                          <a href="tel:+8801811000111" className="text-stone-700 hover:text-[#4a9e2f] transition-colors block mt-0.5 font-mono">
                            +880 1811 000111
                          </a>
                          <a href="tel:+8809613800800" className="text-stone-700 hover:text-[#4a9e2f] transition-colors block font-mono">
                            +880 9613 800800
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#f4f7ee]/60 border border-[#4a9e2f]/20">
                        <div className="w-9 h-9 rounded-full bg-[#4a9e2f]/10 text-[#4a9e2f] flex items-center justify-center shrink-0 mt-0.5">
                          <FiMail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1f2a17]">Email Support</p>
                          <a href="mailto:support@organishi.com" className="text-stone-700 hover:text-[#4a9e2f] transition-colors block mt-0.5">
                            support@organishi.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#f4f7ee]/60 border border-[#4a9e2f]/20">
                        <div className="w-9 h-9 rounded-full bg-[#4a9e2f]/10 text-[#4a9e2f] flex items-center justify-center shrink-0 mt-0.5">
                          <FiMapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1f2a17]">Organishi HQ</p>
                          <p className="text-stone-600 leading-relaxed mt-0.5">
                            House 42, Road 11, Banani, Dhaka 1213, Bangladesh
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#f4f7ee]/60 border border-[#4a9e2f]/20">
                        <div className="w-9 h-9 rounded-full bg-[#4a9e2f]/10 text-[#4a9e2f] flex items-center justify-center shrink-0 mt-0.5">
                          <FiClock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1f2a17]">Showroom Hours</p>
                          <p className="text-stone-600 mt-0.5">Saturday – Thursday: 11:00 AM – 8:00 PM</p>
                          <p className="text-stone-400 text-xs mt-0.5">Friday: Closed</p>
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
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.598347895045!2d90.40263677610023!3d23.79730598818816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70b8061e3ad%3A0x6b40280f93019803!2sBanani%2C%20Dhaka%201213!5e0!3m2!1sen!2sbd!4v1710000000000!5m2!1sen!2sbd"
                width="100%"
                height="380"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Organishi Banani Dhaka Map"
              ></iframe>
            </div>
          </div>
        </ScrollAnimate>

        {/* CONTAINER 2: FAQ */}
        <ScrollAnimate variant="fade-in-up" delay={150}>
          <div className="p-8 sm:p-12 bg-white rounded-2xl flex flex-col lg:flex-row justify-start items-start gap-10 mt-10 shadow-lg border border-[#4a9e2f]/20">
            <div className="flex-1 w-full flex flex-col gap-4">
              <span className="font-gotham text-xs uppercase tracking-wider text-[#4a9e2f] font-semibold">Support</span>
              <h2 className="text-[#1f2a17] text-3xl font-bold font-display">Frequently Asked Questions</h2>
              <p className="text-stone-600 text-sm font-inter leading-relaxed">
                Have questions about our sourcing, organic certification, or nationwide delivery? Find quick answers here.
              </p>
              <div className="mt-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-bold font-gotham uppercase tracking-wider text-[#4a9e2f] hover:underline"
                >
                  Explore Organishi Shop &rarr;
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
