import Link from "next/link";
import { HeroCanvas } from "./hero-canvas";
import { HeroIntro } from "./hero-intro";

const HEADLINE = ["Wear it", "out."];

/**
 * Opens on the subject itself: a length of deep-green cloth (three.js) with a
 * light serif headline set over it. Copy is
 * left-aligned and pinned to the bottom so the cloth reads first.
 */
export function HomeHero({ returnDays }: { returnDays: number }) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink text-chalk">
      <HeroCanvas />
      <div className="page-gutter relative flex min-h-[78svh] flex-col justify-end pb-10 pt-24 md:min-h-[84svh] md:pb-16 lg:max-h-[56rem]">
        <HeroIntro>
          <h1 id="hero-title" className="type-display text-[clamp(3.5rem,13vw,7.5rem)] leading-[0.95]">
            {HEADLINE.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="hero-reveal block">
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p data-hero-after className="hero-reveal type-lead mt-5 max-w-[34ch] text-chalk/85">
            New-season shirts, denim and knits for women, men and kids. Free returns within {returnDays} days.
          </p>
          <div data-hero-after className="hero-reveal mt-7 flex flex-wrap items-center gap-3">
            <Link href="/shop?department=WOMEN" className="type-label inline-flex h-12 items-center bg-chalk px-6 text-ink transition-colors duration-300 hover:bg-chalk/80">
              Shop women
            </Link>
            <Link href="/shop?department=MEN" className="type-label inline-flex h-12 items-center border border-chalk/60 px-6 transition-colors duration-300 hover:border-chalk hover:bg-chalk/10">
              Shop men
            </Link>
            <Link href="/shop?department=KIDS" className="type-label px-2 underline underline-offset-4">
              Kids
            </Link>
          </div>
        </HeroIntro>
      </div>
    </section>
  );
}
