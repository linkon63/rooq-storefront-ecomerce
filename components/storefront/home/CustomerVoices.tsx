"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";

import { activeSocialLinks } from "@/components/storefront/shared/social-platforms";
import type { ShopSocialContact } from "@/lib/shop-api";

import "swiper/css";

/** Portraits come from Unsplash — the host is already allow-listed in next.config.ts. */
const avatar = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=128&h=128&fit=crop&crop=faces&auto=format&q=80`;

/** Placeholder voices until the review API feeds this section. */
const TESTIMONIALS = [
  {
    name: "Ralph Edwards",
    role: "Customer",
    avatar: avatar("1500648767791-00dcc994a43e"),
    quote:
      "As a foodie, I really appreciate authenticity in my platter. So far Organishi has always delivered up to my expectation on that particular note. And having it homemade also adds a cherry on top.",
  },
  {
    name: "Nusrat Jahan",
    role: "Customer",
    avatar: avatar("1494790108377-be9c29b29330"),
    quote:
      "The mustard oil smells exactly like the one my grandmother used to press at home. Delivery was quick and the bottle arrived sealed and clean.",
  },
  {
    name: "Tanvir Hasan",
    role: "Customer",
    avatar: avatar("1507003211169-0a1dd7228f2d"),
    quote:
      "I switched our whole kitchen over to their ghee and cold pressed oils. You can taste the difference, and the pricing is fair for this quality.",
  },
  {
    name: "Farhana Akter",
    role: "Customer",
    avatar: avatar("1438761681033-6461ffad8d80"),
    quote:
      "Ordered the organic chips for my kids and they finished the pack in a day. Good to finally find snacks without artificial colours.",
  },
  {
    name: "Imran Chowdhury",
    role: "Customer",
    avatar: avatar("1472099645785-5658abf4ff4e"),
    quote:
      "Packaging is neat and nothing leaked in transit. The honey is thick and raw — exactly what was described on the product page.",
  },
  {
    name: "Sabrina Rahman",
    role: "Customer",
    avatar: avatar("1544005313-94ddf0286df2"),
    quote:
      "Support answered on WhatsApp within minutes and sorted out my delivery address. Small thing, but it is why I keep ordering here.",
  },
];

interface CustomerVoicesProps {
  /** Social profile URLs from Admin → Settings → Contact & Social Media. */
  social?: ShopSocialContact | null;
}

export default function CustomerVoices({ social }: CustomerVoicesProps) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Only the platforms the admin filled in get a card — a blank field means
  // the shop has no such profile, so there is nothing to link to.
  const socials = activeSocialLinks(social);

  // Two cards per view on desktop, so the dots step in pairs.
  const pageCount = Math.max(1, Math.ceil(TESTIMONIALS.length / 2));

  return (
    <section className="bg-[#f4f7ee] py-14 lg:py-16">
      <div
        className={`mx-auto grid max-w-[1600px] gap-10 px-4 md:px-8 lg:gap-12 ${
          socials.length ? "lg:grid-cols-[minmax(0,1fr)_460px]" : ""
        }`}
      >
        {/* ── Testimonials ────────────────────────────────────────────── */}
        <div>
          <h2 className="font-display text-[26px] leading-tight text-[#1f2a17] md:text-[34px]">
            What Customer Say About Us
          </h2>

          <div className="mt-7">
            <Swiper
              onSwiper={setSwiper}
              onSlideChange={(instance) => setActiveIndex(instance.realIndex)}
              modules={[Autoplay]}
              loop
              autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              spaceBetween={24}
              breakpoints={{ 0: { slidesPerView: 1 }, 768: { slidesPerView: 2 } }}
              // Slides stretch so every card in view shares the tallest height,
              // however long the quote runs.
              className="[&_.swiper-wrapper]:items-stretch"
            >
              {TESTIMONIALS.map((testimonial) => (
                <SwiperSlide key={testimonial.name} className="h-auto!">
                  <figure className="flex h-full flex-col rounded-md bg-white p-6">
                    <figcaption className="flex items-center gap-3">
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#4a9e2f]/10">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <span>
                        <span className="font-display block text-[15px] font-semibold text-[#1f2a17]">
                          {testimonial.name}
                        </span>
                        <span className="block text-[13px] text-gray-500">{testimonial.role}</span>
                      </span>
                    </figcaption>
                    <blockquote className="mt-4 text-[14px] leading-relaxed text-gray-600">
                      {testimonial.quote}
                    </blockquote>
                  </figure>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="mt-8 flex justify-center gap-1.5">
            {Array.from({ length: pageCount }, (_, page) => (
              <button
                key={page}
                type="button"
                onClick={() => swiper?.slideToLoop(page * 2)}
                aria-label={`Go to testimonial page ${page + 1}`}
                className={`h-[3px] rounded-full transition-all ${
                  Math.floor(activeIndex / 2) === page
                    ? "w-9 bg-[#4a9e2f]"
                    : "w-7 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Social ──────────────────────────────────────────────────── */}
        {socials.length > 0 && (
          <div>
            <h2 className="font-display text-[26px] leading-tight text-[#1f2a17] md:text-[34px]">
              Follow Us On
            </h2>

            <div className="mt-7 grid grid-cols-2 gap-5">
              {socials.map(({ key, label, Icon, href }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex h-[88px] items-center justify-center gap-2.5 rounded-md bg-white transition-shadow hover:shadow-md"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded border border-[#4a9e2f]/30 text-[#4a9e2f]">
                    <Icon size={13} />
                  </span>
                  <span className="font-display text-[16px] text-[#4a9e2f]">{label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
