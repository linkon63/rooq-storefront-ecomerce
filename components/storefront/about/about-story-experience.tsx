"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import type { Messages } from "@/lib/i18n/messages";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const AboutLoomCanvas = dynamic(() => import("./about-loom-canvas"), { ssr: false });

function supportsWebGL(): boolean {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2") || document.createElement("canvas").getContext("webgl"));
  } catch {
    return false;
  }
}

export function AboutStoryExperience({ about }: { about: Messages["about"] }) {
  const root = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const reduced = usePrefersReducedMotion();
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setWebgl(supportsWebGL()));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useGSAP(
    () => {
      if (reduced) return;

      if (journeyRef.current) {
        ScrollTrigger.create({
          trigger: journeyRef.current,
          start: "top 75%",
          end: "bottom 35%",
          scrub: 0.6,
          onUpdate: (self) => {
            progress.current = self.progress;
          },
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-about-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 28,
          opacity: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            once: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-about-milestone]").forEach((element) => {
        gsap.from(element, {
          x: 24,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 82%",
            once: true,
          },
        });
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div ref={root} className="page-gutter flex flex-col gap-16 md:gap-24">
      {/* Unboxed editorial pillars */}
      <section aria-labelledby="about-pillars-title" className="flex flex-col gap-6">
        <h2 id="about-pillars-title" className="type-label text-dye">
          {about.pillarsTitle}
        </h2>
        <ol className="divide-y divide-line border-y border-line">
          {about.pillars.map((pillar, index) => (
            <li
              key={pillar.title}
              data-about-reveal
              className="grid gap-4 py-8 md:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1.25fr)] md:items-baseline md:gap-8 md:py-10"
            >
              <span className="font-serif text-[2rem] leading-none text-dye/80">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="font-serif text-[1.375rem] leading-snug font-normal text-ink md:text-[1.625rem]">
                {pillar.title}
              </h3>
              <p className="max-w-[54ch] text-[0.9375rem] leading-relaxed text-stone">{pillar.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Scroll-driven Three.js 3D woven cloth + Company Journey */}
      <section ref={journeyRef} aria-labelledby="about-journey-title" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
        <div className="flex flex-col gap-4 lg:sticky lg:top-28">
          <h2 id="about-journey-title" className="type-label text-dye">
            {about.journeyTitle}
          </h2>
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            {webgl ? (
              <AboutLoomCanvas progress={progress} animate={!reduced} />
            ) : (
              <div aria-hidden className="saree-fallback absolute inset-6 -skew-y-2" />
            )}
          </div>
        </div>

        <ol className="flex flex-col gap-12 py-4 md:gap-20 md:py-10">
          {about.journey.map((milestone) => (
            <li
              key={milestone.year}
              data-about-milestone
              className="relative flex flex-col gap-3 border-l-2 border-dye/40 pl-6 md:pl-8"
            >
              <span className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-none font-light text-ink">
                {milestone.year}
              </span>
              <h3 className="type-h2 text-ink">{milestone.title}</h3>
              <p className="max-w-[46ch] text-[1rem] leading-relaxed text-stone">{milestone.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Unboxed editorial founder & co-founder speeches */}
      <section aria-labelledby="about-speeches-title" className="flex flex-col gap-8 border-t border-line pt-12 md:pt-16">
        <h2 id="about-speeches-title" className="type-label text-dye">
          {about.speechesTitle}
        </h2>
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          {[about.founder, about.coFounder].map((leader) => (
            <figure key={leader.name} data-about-reveal className="flex flex-col justify-between gap-6 border-l border-gold pl-6">
              <blockquote className="font-serif text-[1.25rem] leading-relaxed text-ink md:text-[1.45rem]">
                &ldquo;{leader.speech}&rdquo;
              </blockquote>
              <figcaption className="flex items-baseline gap-3">
                <span className="type-h3 text-ink">{leader.name}</span>
                <span aria-hidden className="text-line">
                  —
                </span>
                <span className="type-label text-stone">{leader.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div data-about-reveal className="flex flex-wrap gap-3 border-t border-line pt-8">
        <Link href="/shop" className="type-label inline-flex h-12 items-center bg-ink px-6 text-chalk transition-colors hover:bg-dye">
          {about.shopCta}
        </Link>
        <Link href="/contact" className="type-label inline-flex h-12 items-center border border-ink px-6 transition-colors hover:bg-ink hover:text-chalk">
          {about.contactCta}
        </Link>
      </div>
    </div>
  );
}

