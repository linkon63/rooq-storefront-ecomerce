import { Fragment, type ReactNode } from "react";
import { getMessages } from "@/lib/i18n/server";
import { getHomeStats } from "@/lib/storefront/catalog-data";
import { fillTemplate, numberLocale } from "@/utils/storefront/fill-template";
import { CountUp } from "./count-up";

/** A stitched underline marks each live number in the sentence. */
function Figure({ children }: { children: ReactNode }) {
  return <span className="whitespace-nowrap border-b-2 border-dashed border-gold pb-0.5 font-semibold text-ink">{children}</span>;
}

/**
 * One sentence of live shop numbers (pieces on sale, orders delivered,
 * review average), each counting up as it scrolls into view. Clauses with
 * nothing to say yet are left out; nothing renders without stock.
 */
export async function MadeByHand() {
  const [stats, { locale, t }] = await Promise.all([getHomeStats(), getMessages()]);
  if (!stats || stats.pieces === 0) return null;
  const copy = t.home.craft;
  const tag = numberLocale(locale);
  const count = (value: number, decimals = 0) => (
    <Figure>
      <CountUp value={value} locale={tag} decimals={decimals} />
    </Figure>
  );

  const clauses = [fillTemplate(copy.stats.pieces, { n: count(stats.pieces) })];
  if (stats.delivered > 0) clauses.push(fillTemplate(copy.stats.delivered, { n: count(stats.delivered) }));
  if (stats.reviewCount > 0 && stats.averageRating !== null) {
    const average = Math.round(stats.averageRating * 10) / 10;
    clauses.push(fillTemplate(copy.stats.rating, { r: count(average, 1), n: count(stats.reviewCount) }));
  }

  return (
    <section aria-labelledby="made-by-hand-title" className="page-gutter">
      <h2 id="made-by-hand-title" className="sr-only">
        {copy.madeByHand}
      </h2>
      <p className="max-w-[34ch] font-serif text-[clamp(1.75rem,4.2vw,3.25rem)] leading-[1.25] text-stone">
        {clauses.map((parts, index) => (
          <Fragment key={index}>
            {index > 0 ? ", " : null}
            {parts.map((part, i) => (
              <Fragment key={i}>{part}</Fragment>
            ))}
          </Fragment>
        ))}
        {copy.stats.end}
      </p>
    </section>
  );
}
