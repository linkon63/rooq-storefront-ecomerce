import Link from "next/link";
import type { HomeHeroData } from "@/types/storefront/content";
import { heroVariant } from "@/utils/storefront/hero";
import { HeroCampaignBanner } from "./hero-campaign-banner";
import { HeroIntro } from "./hero-intro";
import { HeroSlider } from "./hero-slider";

const HEADLINE = ["Wear it", "out."];
const DEFAULT_COPY = "Handloom cottons and zari borders in colours made for the season.";

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
            <p className="type-lead max-w-[40ch] text-stone">
              {copy} Free returns within {returnDays} days.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={campaign?.linkUrl ?? "/shop?category=women-sarees"}
                className="type-label inline-flex h-12 items-center bg-ink px-6 text-chalk transition-colors duration-300 hover:bg-ink/80"
              >
                {campaign?.linkLabel ?? "Shop sarees"}
              </Link>
              <Link href="/new" className="type-label inline-flex h-12 items-center border border-ink px-6 transition-colors duration-300 hover:bg-ink hover:text-chalk">
                New in
              </Link>
            </div>
          </div>
        </div>
      </HeroIntro>
    </section>
  );
}
