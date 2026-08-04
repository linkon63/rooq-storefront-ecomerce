"use client";

import Image from "next/image";
import Link from "next/link";
import { RiArrowRightUpLine } from "react-icons/ri";
import { BiSolidOffer } from "react-icons/bi";
import type { Product } from "@/types/product";
import { getDiscountFromAmount } from "@/utils/amount";
import { getLocalizedText, parsePrice } from "@/utils/convert";

interface TrendingNowProps {
  products?: Product[];
}

export default function TrendingNow({ products = [] }: TrendingNowProps) {
  const displayProducts: Product[] = products.slice(0, 6);

  return (
    <section className="w-full max-w-[1737px] mx-auto px-4 sm:px-6 lg:px-4">
      {/* Section Header */}
      <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
          Trending Now
        </h2>
        <div className="all-products underline">
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-extrabold tracking-wide uppercase text-gray-900  hover:text-gray-700 transition-colors duration-200 flex items-center group"
          >
            See All Product
            <RiArrowRightUpLine size={20} />
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {displayProducts.map((product) => {
          const variant = product.variants?.[0];
          const price = parsePrice(variant?.discount_price) || parsePrice(variant?.current_pricing?.retail_price) || 0;
          const discount = getDiscountFromAmount(product);
          const image =
            product.media?.[0]?.original_url ||
            "/assets/image/placeholder.png";

          const name = getLocalizedText(product.name) || "Product";

          return (
            <Link href={`/product/${product.id}`} key={product.id}>
              <article
                key={product.id}
                className="border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group bg-white"
              >
                <div className="grid grid-cols-12">
                  <figure className="col-span-12 md:col-span-5">
                    <Image
                      src={image}
                      alt={name}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover md:min-h-[250px] xl:min-h-[280px] group-hover:scale-105 transition-transform duration-300"
                    />
                  </figure>
                  <div className="col-span-12 md:col-span-7 p-5 sm:p-6 md:p-7 xl:p-8 flex flex-col">
                    {discount > 0 && (
                      <div className="bg-gray-900 text-white px-4 py-2 mb-4 self-start">
                        <span className="flex items-center gap-1 text-lg font-bold">
                          <BiSolidOffer />
                          {discount}% OFF
                        </span>
                      </div>
                    )}

                    <div className="mt-5 w-full text-gray-900 text-xl font-semibold font-['Inter'] leading-7">
                      {name}
                    </div>

                    <div className="mt-6 inline-flex flex-row justify-start items-start gap-2">
                      <div className="text-right justify-end">
                        <span className="text-neutral-800 text-2xl font-normal font-['SutonnyMJ'] leading-4">
                          ৳
                        </span>
                        <span className="text-neutral-800 text-xl font-semibold font-['Inter'] leading-7">
                          {price}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="text-right justify-start">
                          <span className="text-zinc-500 text-2xl font-normal font-['SutonnyMJ'] line-through leading-7">
                            ৳
                          </span>
                          <span className="text-zinc-500 text-lg font-normal font-['Inter'] line-through leading-7">
                            {parsePrice(product.variants?.[0]?.current_pricing?.retail_price)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
