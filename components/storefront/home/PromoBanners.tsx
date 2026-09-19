import Image from "next/image";
import Link from "next/link";

/** The two story banners that sit between the product grids. */
const BANNERS = [
  {
    image: "/images/home/promo-ghee.png",
    title: ["The Authentic", "Taste of Pure Ghee"],
    body: "Experience the richness of traditional desi ghee, crafted with care to bring natural goodness, delightful aroma, and premium quality to every meal.",
    href: "/shop?category=Ghee",
  },
  {
    image: "/images/home/promo-mustard.png",
    title: ["The True Taste", "of Tradition"],
    body: "Cold-pressed from carefully selected mustard seeds, our mustard oil offers a rich aroma, authentic taste, and natural goodness for healthier everyday cooking.",
    href: "/shop?category=Mustard%20Oil",
  },
];

export default function PromoBanners() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 md:px-8">
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-7">
        {BANNERS.map((banner) => (
          <article key={banner.image} className="group relative overflow-hidden rounded-lg">
            <div className="relative aspect-[848/500] w-full">
              <Image
                src={banner.image}
                alt={banner.title.join(" ")}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Copy sits on the left, so the wash is heaviest there. */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
            </div>

            <div className="absolute inset-y-0 left-0 flex max-w-[62%] flex-col justify-center px-5 py-6 text-white sm:px-8 md:max-w-[55%] lg:px-10">
              <h3 className="font-display text-[22px] leading-tight sm:text-[28px] lg:text-[34px]">
                {banner.title.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h3>
              <p className="mt-2.5 hidden text-[13px] leading-relaxed text-white/85 sm:block lg:mt-4">
                {banner.body}
              </p>
              <div className="mt-4 lg:mt-6">
                <Link
                  href={banner.href}
                  className="inline-flex rounded-full bg-brand px-5 py-2 text-[13px] text-white transition-colors hover:bg-brand-dark"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
