import type { Metadata } from "next";
import { AboutStoryExperience } from "@/components/storefront/about/about-story-experience";
import { SareeHeroSlider } from "@/components/storefront/about/saree-hero-slider";
import { Breadcrumbs } from "@/components/storefront/shared/breadcrumbs";
import { COPY } from "@/lib/constants/storefront-copy";

export const metadata: Metadata = {
  title: "About our handmade sarees",
  alternates: { canonical: "/about" },
  description: "Rooq brings custom-designed, handmade tant sarees straight from real weaving groups at fair prices for the new generation.",
};

export default async function AboutPage() {
  const t = COPY;
  const about = t.about;

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <SareeHeroSlider
        eyebrow={about.sliderEyebrow}
        slides={about.famousSarees}
        prevLabel={about.sliderPrev}
        nextLabel={about.sliderNext}
        slideLabel={about.sliderDots}
      />

      <div className="page-gutter flex flex-col gap-5 border-b border-line pb-8 md:pb-10">
        <Breadcrumbs items={[{ label: about.home, href: "/" }, { label: about.title }]} />
        <header className="flex max-w-[62ch] flex-col gap-3">
          <p className="type-label text-dye">{about.eyebrow}</p>
          <h1 className="font-display font-expanded text-[clamp(2rem,6vw,3.5rem)] font-extrabold leading-none">{about.title}</h1>
          <p className="type-lead text-stone">{about.lead}</p>
        </header>
      </div>

      <AboutStoryExperience about={about} />
    </div>
  );
}
