import Link from "next/link";
import type { Messages } from "@/lib/constants/storefront-copy";
import type { ProductCard, ProductDetail } from "@/types/storefront/catalog";
import { Price } from "../../shared/price";
import { StarRating } from "../../shared/star-rating";
import { HighlightCartButton } from "./highlight-cart-button";
import { HighlightFacts } from "./highlight-facts";
import { HighlightSlider } from "./highlight-slider";

type HighlightCardProps = {
  card: ProductCard;
  detail: ProductDetail | null;
  index: number;
  reverse: boolean;
  t: Messages["home"];
};

function collectImages(card: ProductCard, detail: ProductDetail | null): { url: string; alt: string }[] {
  const seen = new Set<string>();
  const list: { url: string; alt: string }[] = [];
  const push = (url: string | undefined | null, alt?: string | null) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    list.push({ url, alt: alt ?? card.name });
  };

  push(card.image?.url, card.name);
  push(card.hoverImage?.url, card.name);
  if (detail) {
    for (const color of detail.colors) {
      for (const img of color.images) push(img.url, img.alt ?? color.name);
    }
    for (const img of detail.sharedImages) push(img.url, img.alt ?? card.name);
  }
  return list;
}

/** One spotlight saree/piece: all-images slider, woven Alpona frame, story, loom specs & cart CTA. */
export function HighlightCard({ card, detail, index, reverse, t }: HighlightCardProps) {
  const images = collectImages(card, detail);
  const story = detail?.shortDescription ?? detail?.description ?? null;
  const href = `/product/${card.slug}`;
  const edition = String(index + 1).padStart(2, "0");

  return (
    <article
      data-panda-card={card.id}
      className={`group/card relative isolate flex w-full flex-col overflow-hidden border border-line/80 bg-[color-mix(in_oklab,var(--color-selvedge)_32%,var(--color-chalk))] md:flex-row ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Subtle woven saree paar (selvedge) stripe along the top of the card */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] bg-[linear-gradient(90deg,var(--color-ink)_0_28%,var(--color-gold)_28%_52%,var(--color-dye)_52%_76%,var(--color-gold)_76%_100%)] opacity-75"
      />

      {/* Faint Alpona lotus corner watermark behind the story panel */}
      <svg
        aria-hidden
        viewBox="0 0 240 240"
        fill="none"
        className={`pointer-events-none absolute -bottom-16 -z-10 size-72 text-gold/[0.16] ${
          reverse ? "-left-16" : "-right-16"
        }`}
      >
        <circle cx="120" cy="120" r="108" stroke="currentColor" strokeWidth="1" strokeDasharray="2 6" />
        <circle cx="120" cy="120" r="88" stroke="currentColor" strokeWidth="1.1" />
        {Array.from({ length: 12 }, (_, i) => i * 30).map((deg) => (
          <g key={deg} transform={`rotate(${deg} 120 120)`}>
            <path
              d="M120 34 C128 50, 128 66, 120 78 C112 66, 112 50, 120 34 Z"
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle cx="120" cy="24" r="1.8" fill="currentColor" />
          </g>
        ))}
        <circle cx="120" cy="120" r="34" stroke="currentColor" strokeWidth="1" />
        <circle cx="120" cy="120" r="6" fill="currentColor" />
      </svg>

      <HighlightSlider images={images} href={href} productName={card.name} />

      {/* Editorial story & loom details */}
      <div className="flex flex-1 flex-col justify-center gap-2.5 px-4 pb-4 pt-1 md:gap-3 md:py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <span className="type-label text-dye">No. {edition}</span>
          <span aria-hidden className="h-px w-8 bg-gold/60" />
          {card.brand?.name ? <span className="type-label text-stone">{card.brand.name}</span> : null}
        </div>

        <h3 className="type-display text-[clamp(1.35rem,3vw,2.1rem)] leading-[1.06] text-ink">
          <Link href={href} className="transition-colors hover:text-dye">
            {card.name}
          </Link>
        </h3>

        <div className="flex flex-wrap items-center gap-4">
          <Price price={card.price} compareAtPrice={card.compareAtPrice} className="text-lg" />
          {card.ratingCount > 0 ? <StarRating rating={card.ratingAvg} /> : null}
        </div>

        {story ? <p className="line-clamp-2 max-w-[50ch] text-[0.9375rem] leading-relaxed text-stone">{story}</p> : null}
        {detail ? (
          <div className="hidden md:block">
            <HighlightFacts detail={detail} t={t} />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <HighlightCartButton card={card} detail={detail} />
          <Link
            href={href}
            className="group/btn type-label inline-flex h-11 w-fit items-center gap-3 border border-ink bg-transparent px-5 text-ink transition-colors duration-300 hover:bg-ink hover:text-chalk"
          >
            <span>{t.viewDetails}</span>
            <span aria-hidden className="transition-transform duration-300 group-hover/btn:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
