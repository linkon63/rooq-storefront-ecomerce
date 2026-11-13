import Image from "next/image";
import Link from "next/link";
import { getSaleCountdown, getStoreSettings } from "@/lib/storefront/catalog-data";
import { discountLabel } from "@/utils/storefront/countdown";
import { CountdownClock } from "./countdown-clock";

/**
 * The home "sale ends in" banner: the live campaign filed under the
 * Sale Countdown section (admin → Settings → Campaigns), its artwork, copy,
 * offer and a ticking clock. Renders nothing when no such sale is running.
 */
export async function SaleCountdown() {
  const [sale, settings] = await Promise.all([getSaleCountdown(), getStoreSettings()]);
  if (!sale) return null;
  const offer = discountLabel(sale.discount, settings.currency);

  return (
    <section aria-labelledby="sale-countdown-title" className="page-gutter">
      <div className="grid overflow-hidden bg-ink text-chalk md:grid-cols-[1.05fr_1fr]">
        <div className="relative aspect-[4/3] bg-ink-soft md:aspect-auto md:min-h-[30rem]">
          {sale.image ? (
            <Image
              src={sale.image.url}
              alt={sale.image.alt ?? ""}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : null}
          {offer ? (
            <span className="type-label absolute left-4 top-4 bg-dye px-3 py-1.5 text-chalk shadow-lg lg:left-6 lg:top-6">
              {offer}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col justify-center gap-6 p-6 sm:p-10 lg:p-14">
          <p className="type-label flex items-center gap-2 text-selvedge">
            <span aria-hidden className="size-2 animate-pulse rounded-full bg-dye motion-reduce:animate-none" />
            Limited-time sale
          </p>
          <h2 id="sale-countdown-title" className="type-display text-[clamp(2.25rem,5vw,4.25rem)] leading-[0.95]">
            {sale.title}
          </h2>
          {sale.description ? <p className="type-lead max-w-[44ch] text-chalk/80">{sale.description}</p> : null}

          <CountdownClock endAt={sale.endAt} />

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={sale.linkUrl ?? "/sale"}
              className="type-label inline-flex h-12 items-center bg-dye px-7 text-chalk shadow-[0_10px_30px_-10px] shadow-dye transition-colors duration-300 hover:bg-dye-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk"
            >
              {sale.linkLabel ?? "Shop the sale"}
            </Link>
            <Link
              href="/sale"
              className="type-label inline-flex h-12 items-center border border-chalk/60 px-6 transition-colors duration-300 hover:bg-chalk hover:text-ink"
            >
              All offers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
