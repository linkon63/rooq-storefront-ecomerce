"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";

import "swiper/css";

const CERTIFICATES = [
  {
    id: "usda",
    title: "USDA Organic Certified",
    description: "Certified 100% organic, ensuring strict adherence to natural farming and processing standards.",
    image: "/images/certificate/usda.jpg",
  },
  {
    id: "fssc",
    title: "FSSC 22000 Food Safety",
    description: "Global Food Safety Management System certification ensuring total quality control from farm to consumer.",
    image: "/images/certificate/fssc.png",
  },
  {
    id: "iso22000",
    title: "ISO 22000 Certified",
    description: "International standard for food safety management systems ensuring maximum purity and quality.",
    image: "/images/quality/ISO-22000.png",
  },
  {
    id: "sgs",
    title: "SGS Quality Assured",
    description: "Independently inspected and verified by SGS, the world's leading testing and certification body.",
    image: "/images/certificate/sgs.png",
  },
  {
    id: "gmp",
    title: "GMP Certified",
    description: "Good Manufacturing Practice certified, ensuring products are consistently produced to strict safety standards.",
    image: "/images/quality/GMP.png",
  },
  {
    id: "haccp",
    title: "HACCP Certified",
    description: "Hazard Analysis Critical Control Point certified for systematic preventive food safety and hygiene.",
    image: "/images/quality/HACCP.png",
  },
  {
    id: "ukas",
    title: "UKAS Accredited",
    description: "Recognized under United Kingdom Accreditation Service standards for quality management systems.",
    image: "/images/certificate/ukas.jpg",
  },
  {
    id: "iaf",
    title: "IAF Global Recognition",
    description: "International Accreditation Forum recognized quality standards accepted across global food networks.",
    image: "/images/certificate/iaf.webp",
  },
  {
    id: "fda",
    title: "FDA Compliant",
    description: "Complies with global Food and Drug Administration safety standards for consumer health.",
    image: "/images/quality/FDA.png",
  },
];

export default function FeatureStrip() {
  const [, setSwiper] = useState<SwiperClass | null>(null);

  return (
    <section className="mx-auto max-w-[1600px] px-4 md:px-8 py-6 md:py-10">
      <div className="text-center">
        <h2 className="font-display text-center text-[22px] font-bold leading-tight md:font-semibold text-[#1f2a17] md:text-[38px]">
          Our Product Quality & Recognition
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
          Every Organishi product complies with rigorous international food safety, purity, and organic standards.
        </p>
      </div>

      <div className="relative mt-8 md:mt-10">
        <Swiper
          onSwiper={setSwiper}
          modules={[Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          loop={true}
          speed={1000}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            480: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="w-full"
        >
          {CERTIFICATES.map((cert) => (
            <SwiperSlide key={cert.id} className="h-auto">
              <div className="flex h-full flex-col items-center justify-between rounded-xl bg-[#fbfdfa] p-5 text-center">
                <div className="flex h-20 w-full items-center justify-center p-2">
                  <Image
                    src={cert.image}
                    alt={cert.title}
                    width={120}
                    height={80}
                    className="max-h-16 w-auto object-contain"
                  />
                </div>
                <div className="mt-3 flex flex-1 flex-col items-center justify-start">
                  <h3 className="font-display text-base font-semibold text-[#1f2a17]">
                    {cert.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
                    {cert.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
