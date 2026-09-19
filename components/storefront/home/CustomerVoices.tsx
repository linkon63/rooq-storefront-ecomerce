"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";

import { activeSocialLinks } from "@/components/storefront/shared/social-platforms";
import type { ShopSocialContact } from "@/lib/shop-api";

import "swiper/css";

/**
 * Customer voices, in the mix of Bangla and English shoppers actually write in.
 * Hard-coded until the review API feeds this section.
 */
const TESTIMONIALS = [
  {
    name: "Ralph Edwards",
    role: "Customer",
    quote:
      "As a foodie, I really appreciate authenticity in my platter. So far Organishi has always delivered up to my expectation on that particular note. And having it homemade also adds a cherry on top.",
  },
  {
    name: "Farhana Akter",
    role: "Customer",
    quote:
      "Ordered the organic chips for my kids and they finished the pack in a day. Good to finally find snacks without artificial colours.",
  },
  {
    name: "Rezaul Karim",
    role: "Customer",
    quote:
      "সরিষার তেলের ঝাঁঝটাই আসল পরিচয় — এটা পেয়ে মনে হলো গ্রামের ঘানিভাঙা তেল খাচ্ছি। Ordered the 5 litre tin for the whole family, delivery came in two days.",
  },
  {
    name: "Nafisa Tabassum",
    role: "Customer",
    quote:
      "ঘি-টা একদম দানাদার, রঙটাও সোনালি — বাসায় সবাই বলেছে দোকানের ঘি এর থেকে অনেক ভালো. I now keep a jar of the 500g for everyday cooking.",
  },
  {
    name: "Shahriar Alam",
    role: "Customer",
    quote:
      "Spirulina powder-টা smoothie-তে মিশিয়ে খাচ্ছি প্রতিদিন সকালে. প্যাকেজিং seal করা ছিল, আর batch test report চাওয়ায় সাথে সাথে দিয়ে দিয়েছে — that transparency is rare.",
  },
  {
    name: "Sadia Islam",
    role: "Customer",
    quote:
      "Steel cut oats-টা সকালের নাস্তায় দারুণ — দুধ আর কলা দিয়ে খেলে অনেকক্ষণ পেট ভরা থাকে। My husband is diabetic, so a breakfast with no added sugar was exactly what we needed.",
  },
  {
    name: "Mahmudul Hasan",
    role: "Customer",
    quote:
      "প্রথম order টা একটু দ্বিধা নিয়েই দিয়েছিলাম, তবে cash on delivery থাকায় risk কম মনে হয়েছে। Chattogram-এ তিন দিনে পৌঁছেছে and the ghee jar was packed well enough that nothing moved inside the box.",
  },
  {
    name: "Siddika",
    role: "Customer",
    quote:
      "রান্নায় cold pressed তেল ব্যবহার শুরু করার পর ভাজাপোড়ার গন্ধটাই বদলে গেছে, অনেক হালকা লাগে। Already reordered twice, আর delivery-র আগে সবসময় ফোন দিয়ে জানিয়ে দেয়।",
  },
];

/** Stands in for a portrait: first letter of the first two names, e.g. "Nusrat Jahan" → "NJ". */
const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

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
      {/* `grid-cols-1` is not decoration: without an explicit track the columns
          below `lg` are implicit and content-sized, so the swiper's unbounded
          intrinsic width stretches the whole grid to the layout maximum and the
          page's `overflow-x: clip` hides both blocks off-screen. */}
      <div
        className={`mx-auto grid max-w-[1600px] grid-cols-1 gap-10 px-4 md:px-8 lg:gap-12 ${
          socials.length ? "lg:grid-cols-[minmax(0,1fr)_460px]" : ""
        }`}
      >
        {/* ── Testimonials ────────────────────────────────────────────── */}
        <div className="min-w-0">
          <h2 className="font-display text-[22px] font-bold leading-tight text-[#1f2a17] md:text-[34px] md:font-normal">
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
                      {/* aria-hidden: the full name sits right beside it, so a
                          screen reader announcing "NJ" first is just noise. */}
                      <span
                        aria-hidden="true"
                        className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[#4a9e2f]/10 text-[16px] font-semibold text-[#4a9e2f]"
                      >
                        {initials(testimonial.name)}
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
          <div className="min-w-0">
            <h2 className="font-display text-[22px] font-bold leading-tight text-[#1f2a17] md:text-[34px] md:font-normal">
              Follow Us On
            </h2>

            <div className="mt-7 grid grid-cols-2 gap-5">
              {/* Each mark carries its own logo colour rather than the shop green.
                  Inline styles, not classes: Tailwind cannot generate a class it
                  never sees written out, and these colours come from data. The
                  border is the same hex at 30% alpha — `4D` — to match the tint
                  the outlined chips elsewhere on the page use. */}
              {socials.map(({ key, label, Icon, color, href }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex h-[88px] items-center justify-center gap-2.5 rounded-md bg-white transition-shadow hover:shadow-md"
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded border"
                    style={{ color, borderColor: `${color}4D` }}
                  >
                    <Icon size={13} />
                  </span>
                  <span className="font-display text-[16px]" style={{ color }}>
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
