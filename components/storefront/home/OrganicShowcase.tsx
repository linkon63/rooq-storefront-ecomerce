import Image from "next/image";
import Link from "next/link";
import { PiLeaf, PiPlant, PiDrop, PiArrowRight } from "react-icons/pi";

/**
 * Sits where the video gallery used to. A collage of organic produce beside the
 * promise copy — photography is served from Unsplash, whose host is already
 * allow-listed in next.config.ts.
 */
const shot = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

const COLLAGE = [
  {
    src: shot("1542838132-92c53300491e", 800, 1000),
    alt: "Fresh organic vegetables on a market table",
    // Tall hero tile on the left of the collage.
    className: "col-span-2 row-span-2",
  },
  {
    src: shot("1447175008436-054170c2e979", 600, 500),
    alt: "Baskets of freshly harvested produce",
    className: "col-span-2",
  },
  {
    src: shot("1512621776951-a57141f2eefd", 400, 400),
    alt: "A bowl of crisp seasonal salad",
    className: "",
  },
  {
    src: shot("1466637574441-749b8f19452f", 400, 400),
    alt: "Green leafy vegetables straight from the field",
    className: "",
  },
];

const PROMISES = [
  {
    icon: PiPlant,
    title: "Grown, not manufactured",
    body: "Sourced from farms that skip synthetic pesticides and chemical fertilisers.",
  },
  {
    icon: PiDrop,
    title: "Cold pressed, never refined",
    body: "Oils and ghee keep their aroma because nothing is bleached or deodorised.",
  },
  {
    icon: PiLeaf,
    title: "Nothing artificial added",
    body: "No colours, no preservatives, no fillers — just what the label says.",
  },
];

export default function OrganicShowcase() {
  return (
    <section className="mx-auto max-w-[1600px] px-4 md:px-8">
      <div className="overflow-hidden rounded-3xl bg-[#f4f7ee]">
        <div className="grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14">
          {/* ── Collage ───────────────────────────────────────────────── */}
          <div className="relative">
            {/* Fixed height so the `fill` images inside each tile have a box to fill. */}
            <div className="grid h-[320px] grid-cols-4 grid-rows-2 gap-3 sm:h-[420px] sm:gap-4 lg:h-[460px]">
              {COLLAGE.map((image) => (
                <div
                  key={image.src}
                  className={`group relative overflow-hidden rounded-2xl ${image.className}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>

            {/* Seal floating over the seam of the collage. */}
            <div className="font-display absolute -bottom-4 left-1/2 flex h-24 w-24 -translate-x-1/2 flex-col items-center justify-center rounded-full bg-[#4a9e2f] text-white shadow-lg ring-8 ring-[#f4f7ee] sm:-bottom-6 sm:h-28 sm:w-28">
              <span className="text-[24px] leading-none sm:text-[28px]">100%</span>
              <span className="mt-1 text-[11px] tracking-[0.2em] uppercase">Organic</span>
            </div>
          </div>

          {/* ── Copy ──────────────────────────────────────────────────── */}
          <div className="mt-8 lg:mt-0">
            <span className="font-display inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] text-[#4a9e2f]">
              <PiLeaf size={15} />
              Straight from the farm
            </span>

            <h2 className="font-display mt-4 text-[28px] leading-tight text-[#1f2a17] md:text-[38px]">
              Real organic food, the way it used to taste
            </h2>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-gray-600">
              Every jar, bottle and pack on Organishi starts on a farm we know by name. We keep the
              chain short — harvest, press, pack, deliver — so nothing is stripped out on the way to
              your kitchen.
            </p>

            <ul className="mt-7 space-y-5">
              {PROMISES.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#4a9e2f]">
                    <Icon size={21} />
                  </span>
                  <span>
                    <span className="font-display block text-[17px] leading-tight text-[#1f2a17]">
                      {title}
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-gray-600">
                      {body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/shop"
              className="font-display mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-[#4a9e2f] px-7 text-[15px] text-white transition-colors hover:bg-[#3d8626]"
            >
              Shop organic
              <PiArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
