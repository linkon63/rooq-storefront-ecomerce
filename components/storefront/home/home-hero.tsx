import Link from "next/link";
import { HeroCanvas } from "./hero-canvas";
import { HeroIntro } from "./hero-intro";

const HEADLINE = ["Wear it", "out."];

/**
 * Opens on the subject itself: a length of deep-green cloth (three.js) with the
 * wordmark-weight headline set in Archivo Expanded over it. Copy is
 * left-aligned and pinned to the bottom so the cloth reads first.
 */
export function HomeHero({ returnDays }: { returnDays: number }) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink text-chalk">
      <HeroCanvas />
      <div className="page-gutter relative flex min-h-[78svh] flex-col justify-end pb-10 pt-24 md:min-h-[84svh] md:pb-16 lg:max-h-[56rem]">
        <HeroIntro>
          <h1 id="hero-title" className="font-display font-expanded text-[clamp(3.25rem,13vw,8.5rem)] font-extrabold leading-[0.9] tracking-[-0.03em]">
            {HEADLINE.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="hero-reveal block">
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p data-hero-after className="hero-reveal mt-5 max-w-[34ch] text-base text-chalk/85 md:text-lg">
            New-season shirts, denim and knits for women, men and kids. Free returns within {returnDays} days.
          </p>
          <div data-hero-after className="hero-reveal mt-7 flex flex-wrap items-center gap-3">
            <Link href="/shop?department=WOMEN" className="inline-flex h-12 items-center rounded bg-chalk px-6 text-sm font-semibold text-ink hover:bg-dye">
              Shop women
            </Link>
            <Link href="/shop?department=MEN" className="inline-flex h-12 items-center rounded border border-chalk/60 px-6 text-sm font-semibold hover:border-chalk hover:bg-chalk/10">
              Shop men
            </Link>
            <Link href="/shop?department=KIDS" className="px-2 text-sm font-semibold underline underline-offset-4">
              Kids
            </Link>
          </div>
        </HeroIntro>
      </div>
    </section>
  );
}
