import Image from "next/image";
import Link from "next/link";
import { PiArrowRight } from "react-icons/pi";

import type { ShopProduct } from "@/lib/shop-api";

interface LatestArrivalsProps {
  /** Catalogue order — the API returns products newest first. */
  products: ShopProduct[];
}

const money = (value: number) =>
  `৳${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Sits where the two artwork banners used to. Same footprint on the page, but
 * the two panels now carry the newest products in the catalogue instead of
 * fixed pictures.
 */
export default function LatestArrivals({ products }: LatestArrivalsProps) {
  const latest = products.slice(0, 2);
  if (latest.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1600px] px-4 md:px-8">
      <div className="flex flex-col items-center text-center">
        <h2 className="font-display text-[22px] font-bold leading-tight md:font-semibold text-[#1f2a17] md:text-[38px]">
          Our Latest Arrivals
        </h2>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-gray-600">
          The two newest additions to the shelf — fresh in stock and ready to ship.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2 lg:gap-7 md:mt-10">
        {latest.map((product) => {
          const hasDiscount = !!product.originalPrice && product.originalPrice > product.price;
          const saving = hasDiscount
            ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
            : 0;
          const href = `/product/${product.id}`;

          return (
            <article
              key={product.id}
              className="group grid grid-cols-2 overflow-hidden rounded-lg bg-brand-mist"
            >
              {/* ── Copy ────────────────────────────────────────────────── */}
              <div className="flex flex-col justify-center px-5 py-6 sm:px-8 lg:px-10">
                {product.category && (
                  <span className="text-[12px] tracking-[0.18em] text-gray-500 uppercase">
                    {product.category}
                  </span>
                )}

                <h3 className="font-display mt-1.5 text-[18px] leading-tight text-[#1f2a17] sm:text-[26px] lg:text-[30px]">
                  {product.name}
                </h3>

                {product.comingSoon ? (
                  <span className="font-display mt-3 w-fit bg-[#1f2a17] px-3 py-1.5 text-[11px] tracking-wider text-white uppercase">
                    Coming Soon
                  </span>
                ) : (
                  <p className="mt-3 flex flex-wrap items-center gap-2.5">
                    <span className="font-display text-[18px] font-semibold text-[#1f2a17] sm:text-[24px]">
                      {money(product.price)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="font-display text-[14px] text-gray-400 line-through">
                          {money(product.originalPrice!)}
                        </span>
                        <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-[12px] text-brand">
                          Save {saving}%
                        </span>
                      </>
                    )}
                  </p>
                )}

                <div className="mt-5 lg:mt-7">
                  <Link
                    href={href}
                    className="font-display inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-[13px] text-white transition-colors hover:bg-brand-dark sm:px-6 sm:py-2.5 sm:text-[15px]"
                  >
                    {product.comingSoon ? "View Details" : "Shop Now"}
                    <PiArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* ── Product shot ────────────────────────────────────────── */}
              <Link href={href} aria-label={product.name} className="relative aspect-square bg-white">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-sm text-gray-400">
                    No image
                  </span>
                )}
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
