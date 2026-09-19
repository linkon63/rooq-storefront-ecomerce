import Image from "next/image";
import Link from "next/link";
import { PiLeaf, PiPlant, PiDrop, PiArrowRight } from "react-icons/pi";

/**
 * Sits where the video gallery used to. A collage of the Organishi range beside
 * the promise copy — the packshots are served from `public/images/organishi`,
 * so no remote host has to be allow-listed in next.config.ts.
 */
const COLLAGE = [
  {
    src: "/images/organishi/d4e07d8f-adb2-4b8a-9ea9-492b6799a6f4.jpeg",
    alt: "Organishi cold pressed mustard oil tin",
    // Tall hero tile on the left of the collage — the tin is the tallest pack,
    // so it is the one that fills a two-row box without stranding whitespace.
    className: "col-span-2 row-span-2",
  },
  {
    src: "/images/organishi/23ef436d-29b8-4dfa-8bcb-c796589c012f.jpeg",
    alt: "Organishi chia seed jar",
    className: "col-span-2",
  },
  {
    src: "/images/organishi/8d239828-cd39-44eb-a5cf-073a8d2e5d9d.jpeg",
    alt: "Organishi pure cow ghee jar",
    className: "",
  },
  {
    src: "/images/organishi/a9ffc05e-18bc-447c-afea-971125766938.jpeg",
    alt: "Organishi almond nut jar",
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
      <div className="overflow-hidden rounded-3xl bg-brand-mist">
        <div className="grid items-center gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:gap-14 lg:p-14">
          {/* ── Collage ───────────────────────────────────────────────── */}
          <div className="relative">
            {/* Fixed height so the `fill` images inside each tile have a box to fill. */}
            <div className="grid h-[320px] grid-cols-4 grid-rows-2 gap-3 sm:h-[420px] sm:gap-4 lg:h-[460px]">
              {COLLAGE.map((image) => (
                <div
                  key={image.src}
                  className={`group relative overflow-hidden rounded-2xl bg-white ${image.className}`}
                >
                  {/* `object-contain` on a white tile, not `object-cover`: these are
                      studio packshots that already sit centred on white, so cropping
                      to fill would slice the lid or the label off the pack. */}
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-2 transition-transform duration-700 group-hover:scale-105 sm:p-3"
                  />
                </div>
              ))}
            </div>

            {/* Seal floating over the seam of the collage. */}
            <div className="font-display absolute -bottom-4 left-1/2 flex h-24 w-24 -translate-x-1/2 flex-col items-center justify-center rounded-full bg-brand text-white shadow-lg ring-8 ring-brand-mist sm:-bottom-6 sm:h-28 sm:w-28">
              <span className="text-[24px] leading-none sm:text-[28px]">100%</span>
              <span className="mt-1 text-[11px] tracking-[0.2em] uppercase">Organic</span>
            </div>
          </div>

          {/* ── Copy ──────────────────────────────────────────────────── */}
          <div className="mt-8 lg:mt-0">
            <span className="font-display inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[13px] text-brand">
              <PiLeaf size={15} />
              Straight from the farm
            </span>

            <h2 className="font-display mt-4 text-[22px] font-bold leading-tight md:font-semibold text-[#1f2a17] md:text-[38px]">
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
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-brand-sky-dark">
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
              className="font-display mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-brand px-7 text-[15px] text-white transition-colors hover:bg-brand-dark"
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
