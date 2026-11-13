import Link from "next/link";
import type { HomeHeroData } from "@/types/storefront/content";
import { heroVariant } from "@/utils/storefront/hero";
import { HeroCampaignBanner } from "./hero-campaign-banner";
import { HeroIntro } from "./hero-intro";
import { HeroSlider } from "./hero-slider";

const HEADLINE = ["Wear it", "out."];
const DEFAULT_COPY = "Handloom cottons and zari borders in colours made for the season.";
const HERITAGE_BADGE = "100% original handloom tant";
const HERITAGE_COPY =
  "Every saree is woven by hand on a real tant loom and brought straight from the weavers of Tangail and Shantipur — no power-loom copies, only the original craft passed down through generations.";

type HomeHeroProps = { returnDays: number; hero: HomeHeroData };

/**
 * The home hero, in the mode chosen in the admin (Settings → Hero Slider):
 * - slider: the looks gliding on white (each may show its product's card),
 *   then a light serif headline and the call to action;
 * - campaign: the live hero campaign as one banner.
 */
export function HomeHero({ returnDays, hero }: HomeHeroProps) {
  const variant = heroVariant(hero);
  const { campaign } = hero;
  if (variant === "campaign" && campaign) return <HeroCampaignBanner campaign={campaign} returnDays={returnDays} />;
  const copy = campaign?.description ?? DEFAULT_COPY;
  return (
    <section aria-labelledby="hero-title" className="bg-white">
      {variant === "slider" ? <HeroSlider slides={hero.slides} /> : null}
      <HeroIntro>
        <div className="page-gutter grid items-end gap-6 pb-8 pt-6 lg:grid-cols-[1.3fr_1fr] lg:pb-12 lg:pt-10">
          <h1 id="hero-title" className="type-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.95]">
            {HEADLINE.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="hero-reveal block">
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <div data-hero-after className="hero-reveal flex flex-col gap-5">
            <p className="type-label inline-flex w-fit items-center gap-2 border border-gold/60 bg-selvedge/50 px-3 py-1.5 text-ink">
              <span aria-hidden className="size-1.5 rounded-full bg-dye" />
              {HERITAGE_BADGE}
            </p>
            <p className="type-lead max-w-[44ch] text-stone">
              {copy} Free returns within {returnDays} days.
            </p>
            <p className="max-w-[48ch] border-l-2 border-dye pl-4 text-[0.9375rem] leading-relaxed text-ink">{HERITAGE_COPY}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={campaign?.linkUrl ?? "/shop?category=women-sarees"}
                className="type-label inline-flex h-12 items-center gap-2 bg-dye px-7 text-chalk shadow-lg shadow-dye/25 ring-2 ring-dye/20 ring-offset-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-dye-deep hover:shadow-xl focus-visible:ring-dye"
              >
                {campaign?.linkLabel ?? "Shop the edit"}
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/new"
                className="type-label inline-flex h-12 items-center border-2 border-ink bg-chalk px-7 text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-chalk"
              >
                New in
              </Link>
            </div>
          </div>
        </div>
      </HeroIntro>
    </section>
  );
}
