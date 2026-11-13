import Image from "next/image";
import Link from "next/link";
import type { ProductCard, ProductDetail } from "@/types/storefront/catalog";
import { Price } from "../../shared/price";
import { StarRating } from "../../shared/star-rating";
import { HighlightFacts } from "./highlight-facts";

type HighlightCardProps = { card: ProductCard; detail: ProductDetail | null; reverse: boolean };

/** One spotlight product: two pictures side by side, then its name, price, story and details. */
export function HighlightCard({ card, detail, reverse }: HighlightCardProps) {
  const pictures = [card.image, card.hoverImage].filter((image) => image !== null);
  const story = detail?.shortDescription ?? detail?.description ?? null;
  const href = `/product/${card.slug}`;
  return (
    <article className={`flex flex-col bg-selvedge/30 md:flex-row ${reverse ? "md:flex-row-reverse" : ""}`}>
      <Link href={href} className="grid flex-[1.2] grid-cols-2 gap-[3px]" aria-label={card.name}>
        {pictures.length === 0 ? <span className="col-span-2 aspect-[3/2] bg-selvedge" /> : null}
        {pictures.map((image, index) => (
          <span
            key={image.url}
            className={`relative block aspect-[3/4] overflow-hidden bg-selvedge ${pictures.length === 1 ? "col-span-2 aspect-[4/3]" : ""}`}
          >
            <Image
              src={image.url}
              alt={index === 0 ? card.name : ""}
              fill
              sizes="(min-width: 768px) 28vw, 50vw"
              className="object-cover transition-transform duration-700 ease-(--ease-quiet) hover:scale-[1.03]"
            />
          </span>
        ))}
      </Link>
      <div className="flex flex-1 flex-col justify-center gap-4 p-6 lg:p-10">
        {card.brand?.name ? <p className="type-label text-stone">{card.brand.name}</p> : null}
        <h3 className="type-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.05]">
          <Link href={href} className="hover:underline">
            {card.name}
          </Link>
        </h3>
        <Price price={card.price} compareAtPrice={card.compareAtPrice} className="text-lg" />
        {card.ratingCount > 0 ? <StarRating rating={card.ratingAvg} /> : null}
        {story ? <p className="line-clamp-4 max-w-[52ch] text-[0.9375rem] leading-relaxed text-stone">{story}</p> : null}
        {detail ? <HighlightFacts detail={detail} /> : null}
        <Link
          href={href}
          className="type-label inline-flex h-12 w-fit items-center gap-2 bg-ink px-6 text-chalk transition-colors duration-300 hover:bg-dye"
        >
          View details <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
