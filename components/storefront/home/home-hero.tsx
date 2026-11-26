import Link from "next/link";
import { COPY } from "@/lib/constants/storefront-copy";
import type { ProductCard } from "@/types/storefront/catalog";
import type { HomeHeroData } from "@/types/storefront/content";
import { heroVariant } from "@/utils/storefront/hero";
import { HeroCampaignBanner } from "./hero-campaign-banner";
import { HeroIntro } from "./hero-intro";
import { HeroMobileProducts } from "./hero-mobile-products";
import { HeroSlider } from "./hero-slider";

type HomeHeroProps = { returnDays: number; hero: HomeHeroData; latest: ProductCard[] };

/**
 * The home hero, in the mode chosen in the admin (Settings → Hero Slider):
 * - slider: the looks gliding on white (each may show its product's card),
 *   then a light serif headline and the call to action; on phones the
 *   newest products slide instead of the looks;
 * - campaign: the live hero campaign as one banner.
 */
export async function HomeHero({ returnDays, hero, latest }: HomeHeroProps) {
  const t = COPY;
  const variant = heroVariant(hero);
  const { campaign } = hero;
  if (variant === "campaign" && campaign) return <HeroCampaignBanner campaign={campaign} returnDays={returnDays} />;
  const copy = campaign?.description ?? t.home.heroCopy;
  return (
    <section aria-labelledby="hero-title" className="bg-white">
      {variant === "slider" ? (
        <>
          <div className={latest.length ? "hidden lg:block" : undefined}>
            <HeroSlider slides={hero.slides} labels={{ play: t.home.playShow, pause: t.home.pauseShow }} />
          </div>
          {latest.length ? (
            <HeroMobileProducts
              products={latest}
              labels={{ region: t.home.newIn, dot: t.home.goToSlide, view: t.home.viewDetails }}
              className="page-gutter lg:hidden"
            />
          ) : null}
        </>
      ) : null}
      <HeroIntro>
        <div className="page-gutter grid items-end gap-6 pb-8 pt-6 lg:grid-cols-[1.3fr_1fr] lg:pb-12 lg:pt-10">
          <h1 id="hero-title" className="type-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.95]">
            {t.home.headline.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="hero-reveal weft-done relative block">
                  <span data-weft="a" className="weft-a block">
                    {line}
                  </span>
                  <span data-weft="b" aria-hidden className="weft-b absolute inset-0 block">
                    {line}
                  </span>
                </span>
              </span>
            ))}
          </h1>
          <div data-hero-after className="hero-reveal flex flex-col gap-5">
            <p className="type-label inline-flex w-fit items-center gap-2 border border-gold/60 bg-selvedge/50 px-3 py-1.5 text-ink">
              <span aria-hidden className="size-1.5 rounded-full bg-dye" />
              {t.home.heritageBadge}
            </p>
            <p className="type-lead max-w-[44ch] text-stone">
              {copy} {t.home.freeReturns.replace("{days}", String(returnDays))}
            </p>
            <p className="max-w-[48ch] border-l-2 border-dye pl-4 text-[0.9375rem] leading-relaxed text-ink">{t.home.heritageCopy}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={campaign?.linkUrl ?? "/shop?category=women-sarees"}
                className="type-label inline-flex h-12 items-center gap-2 bg-dye px-7 text-chalk shadow-lg shadow-dye/25 ring-2 ring-dye/20 ring-offset-2 transition-all duration-300 hover:-translate-y-0.5 hover:bg-dye-deep hover:shadow-xl focus-visible:ring-dye"
              >
                {campaign?.linkLabel ?? t.home.shopEdit}
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/new"
                className="type-label inline-flex h-12 items-center border-2 border-ink bg-chalk px-7 text-ink transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-chalk"
              >
                {t.nav.newIn}
              </Link>
            </div>
          </div>
        </div>
      </HeroIntro>
    </section>
  );
}
