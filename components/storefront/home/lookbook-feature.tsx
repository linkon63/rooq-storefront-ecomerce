import Image from "next/image";
import Link from "next/link";
import { getMessages } from "@/lib/i18n/server";
import type { CollectionSummary } from "@/types/storefront/catalog";
import { CrossStitch } from "../shared/cross-stitch";
import { ParallaxLayers } from "./parallax-layers";
import { RevealHeading } from "./reveal-heading";

/**
 * A featured lookbook, edge to edge: cover on one side, the invitation to
 * shop the look on the other. Three depths move as it scrolls by: the cover
 * (slow), a stitched-on fabric close-up cut from the same photo (fast) and
 * the copy (slightly slow).
 */
export async function LookbookFeature({ lookbook }: { lookbook: CollectionSummary }) {
  const { t } = await getMessages();
  const cover = lookbook.coverImageUrl;
  return (
    <ParallaxLayers>
      <section aria-labelledby="lookbook-title" className="grid overflow-hidden bg-selvedge md:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden md:aspect-auto md:min-h-[36rem]">
          <div data-depth="0.07" className="absolute inset-x-0 -inset-y-[9%]">
            {cover ? (
              <Image src={cover} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            ) : (
              <div aria-hidden className="hero-fabric-fallback absolute inset-0" />
            )}
          </div>
        </div>
        <div className="relative flex flex-col justify-end gap-5 p-6 md:p-12 lg:p-16">
          {cover ? (
            <div
              aria-hidden
              data-depth="-0.35"
              className="absolute -top-16 left-6 z-10 size-28 rotate-3 overflow-hidden bg-chalk p-1.5 shadow-xl outline-1 outline-offset-[-5px] outline-gold outline-dashed md:-left-20 md:top-24 md:size-44"
            >
              <div className="relative size-full overflow-hidden">
                <Image src={cover} alt="" fill sizes="(min-width: 768px) 30rem, 18rem" className="scale-[2.6] object-cover" />
              </div>
              <CrossStitch className="absolute -top-1.5 left-1/2 size-4 -translate-x-1/2" />
            </div>
          ) : null}
          <div data-depth="0.05" className="flex flex-col gap-5">
            <RevealHeading id="lookbook-title">{lookbook.name}</RevealHeading>
            {lookbook.description ? <p className="type-lead max-w-[46ch]">{lookbook.description}</p> : null}
            <Link
              href={`/collections/${lookbook.slug}`}
              className="type-label inline-flex h-12 w-fit items-center bg-ink px-6 text-chalk transition-colors duration-300 hover:bg-ink/80"
            >
              {t.home.shopLooks}
            </Link>
          </div>
        </div>
      </section>
    </ParallaxLayers>
  );
}
