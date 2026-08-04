import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PiDrop, PiFarm, PiHandHeart, PiLeaf, PiSealCheck, PiTruck } from "react-icons/pi";

export const metadata: Metadata = {
  title: "About Us | Organishi",
  description:
    "Organishi works directly with Bangladeshi farming families to bring cold pressed oils, hand-churned ghee, raw honey and organic snacks to your kitchen — pure, traceable and free of additives.",
};

const VALUES = [
  {
    icon: PiFarm,
    title: "Sourced at the farm",
    body: "We buy straight from the families who grow and press, so nothing changes hands — or gets diluted — along the way.",
  },
  {
    icon: PiDrop,
    title: "Cold pressed, small batch",
    body: "Oils are pressed slowly at low temperature, keeping the aroma, colour and nutrition the seed started with.",
  },
  {
    icon: PiSealCheck,
    title: "Nothing added",
    body: "No preservatives, no artificial colour, no filler oils. What is on the label is all that is in the bottle.",
  },
  {
    icon: PiHandHeart,
    title: "Fair to the farmer",
    body: "Our growers are paid above market rate and on time, because good food starts with people who are treated well.",
  },
];

const STEPS = [
  {
    title: "We visit and select",
    body: "Every season we walk the farms ourselves, taste the harvest and pick the lots worth bottling.",
  },
  {
    title: "We press in small batches",
    body: "Cold pressing and slow churning happen in batches small enough to check by hand, never by the tonne.",
  },
  {
    title: "We test before we seal",
    body: "Purity, moisture and acidity are checked on every batch. Anything below standard never reaches a bottle.",
  },
  {
    title: "We deliver fresh",
    body: "Orders ship within 48 hours of packing, so what reaches your kitchen is as fresh as the day it was made.",
  },
];

const STATS = [
  { value: "100%", label: "Natural & additive free" },
  { value: "40+", label: "Partner farming families" },
  { value: "6", label: "Product ranges" },
  { value: "12k+", label: "Orders delivered" },
];

const RANGE = [
  {
    image: "/images/home/banner-coconut.png",
    label: "Coconut Virgin Oil",
    href: "/shop?category=Coconut%20Oil",
  },
  {
    image: "/images/home/banner-mustard.png",
    label: "Mustard Oil",
    href: "/shop?category=Mustard%20Oil",
  },
];

export default function AboutPage() {
  return (
    <main>
      {/* ── Page banner ─────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/home/newsletter-bg.png"
          alt=""
          fill
          sizes="100vw"
          priority
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[#1f2a17]/60" />

        <div className="mx-auto max-w-[1600px] px-4 py-16 text-center md:px-8 lg:py-20">
          <h1 className="font-display text-[30px] leading-tight text-white md:text-[44px]">
            About Us
          </h1>
          <p className="mt-3 text-[14px] text-white/80">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span className="px-2">/</span>
            <span className="text-[#8fd06b]">About Us</span>
          </p>
        </div>
      </section>

      {/* ── Story ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1600px] px-4 py-14 md:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[848/560] overflow-hidden rounded-lg">
            <Image
              src="/images/home/promo-ghee.png"
              alt="Hand-churned desi ghee from grass-fed cows"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div>
            <span className="text-[13px] uppercase tracking-[0.2em] text-[#4a9e2f]">
              Heal With Nature
            </span>
            <h2 className="font-display mt-3 text-[26px] leading-tight text-[#1f2a17] md:text-[36px]">
              Real food, the way it was made before shortcuts
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-gray-600">
              <p>
                Organishi started with a simple frustration: the mustard oil, ghee and honey on
                supermarket shelves rarely tasted like the ones our families used at home. Somewhere
                between the farm and the bottle, the good part had been processed out.
              </p>
              <p>
                So we went back to the source. Today we work with farming families across
                Bangladesh — pressing seeds cold, churning ghee by hand, and bottling honey the way
                it comes off the comb. Every batch is small enough that we can taste it, test it and
                stand behind it.
              </p>
              <p>
                No additives, no colouring, no clever labelling. Just food you can trace back to the
                field it came from.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="font-display rounded-full bg-[#4a9e2f] px-7 py-2.5 text-[15px] text-white transition-colors hover:bg-[#3d8626]"
              >
                Shop Our Range
              </Link>
              <Link
                href="/contact"
                className="font-display rounded-full border border-[#4a9e2f]/40 px-7 py-2.5 text-[15px] text-[#4a9e2f] transition-colors hover:bg-[#f4f7ee]"
              >
                Talk To Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section className="bg-[#4a9e2f]">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-8 px-4 py-12 md:px-8 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center text-white">
              <p className="font-display text-[30px] leading-none md:text-[40px]">{stat.value}</p>
              <p className="mt-2 text-[13px] text-white/85">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1600px] px-4 py-14 md:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[26px] leading-tight text-[#1f2a17] md:text-[36px]">
            What We Stand For
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
            Four promises we make on every single order, from a 250ml bottle to a family-size jar.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-xl border border-gray-100 p-7 transition-shadow hover:shadow-[0_1px_24px_rgba(31,42,23,0.07)]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f4f7ee] text-[#4a9e2f]">
                <Icon size={24} />
              </span>
              <h3 className="font-display mt-4 text-[19px] leading-tight text-[#1f2a17]">{title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Process ─────────────────────────────────────────────────────── */}
      <section className="bg-[#f4f7ee] py-14 lg:py-20">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[26px] leading-tight text-[#1f2a17] md:text-[36px]">
              From The Field To Your Kitchen
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-600">
              Four steps, and we own every one of them.
            </p>
          </div>

          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-xl bg-white p-7">
                <span className="font-display flex h-11 w-11 items-center justify-center rounded-full bg-[#4a9e2f] text-[17px] text-white">
                  {index + 1}
                </span>
                <h3 className="font-display mt-4 text-[19px] leading-tight text-[#1f2a17]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Range ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1600px] px-4 py-14 md:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <h2 className="font-display text-[26px] leading-tight text-[#1f2a17] md:text-[36px]">
              A Small Range, Made Properly
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
              We would rather do six things well than sixty badly. Cold pressed mustard and coconut
              oil, hand-churned ghee, raw honey, stone-ground spices and dried organic snacks — each
              one from a producer we know by name.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Cold pressed oils bottled within days of pressing",
                "Ghee churned from grass-fed cow's milk, never blended",
                "Snacks dried without sugar syrup or artificial colour",
              ].map((line) => (
                <li key={line} className="flex gap-3 text-[15px] text-gray-600">
                  <PiLeaf className="mt-1 shrink-0 text-[#4a9e2f]" size={18} />
                  {line}
                </li>
              ))}
            </ul>

            <Link
              href="/shop"
              className="font-display mt-8 inline-flex rounded-full bg-[#4a9e2f] px-7 py-2.5 text-[15px] text-white transition-colors hover:bg-[#3d8626]"
            >
              Browse All Products
            </Link>
          </div>

          <div className="grid gap-5">
            {RANGE.map((item) => (
              <Link
                key={item.image}
                href={item.href}
                className="group relative block overflow-hidden rounded-lg"
              >
                <div className="relative aspect-[552/300] w-full">
                  <Image
                    src={item.image}
                    alt={item.label}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ─────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/home/promo-mustard.png"
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[#1f2a17]/65" />

        <div className="mx-auto max-w-[1600px] px-4 py-16 text-center md:px-8 lg:py-20">
          <h2 className="font-display text-[26px] leading-tight text-white md:text-[38px]">
            Taste What Real Food Tastes Like
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] text-white/85">
            Free delivery inside Dhaka on orders over ৳2,000, and a full refund if a bottle ever
            falls short.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/shop"
              className="font-display rounded-full bg-[#4a9e2f] px-7 py-2.5 text-[15px] text-white transition-colors hover:bg-[#3d8626]"
            >
              Shop Now
            </Link>
            <Link
              href="/contact"
              className="font-display inline-flex items-center gap-2 rounded-full border border-white/50 px-7 py-2.5 text-[15px] text-white transition-colors hover:bg-white/10"
            >
              <PiTruck size={18} />
              Delivery & Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
