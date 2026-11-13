import Image from "next/image";
import Link from "next/link";
import type { CollectionSummary } from "@/types/storefront/catalog";
import { RevealHeading } from "./reveal-heading";

/** A featured lookbook, edge to edge: cover on one side, the invitation to shop the look on the other. */
export function LookbookFeature({ lookbook }: { lookbook: CollectionSummary }) {
  return (
    <section aria-labelledby="lookbook-title" className="grid bg-selvedge md:grid-cols-2">
      <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[36rem]">
        {lookbook.coverImageUrl ? (
          <Image src={lookbook.coverImageUrl} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        ) : (
          <div aria-hidden className="hero-fabric-fallback absolute inset-0" />
        )}
      </div>
      <div className="flex flex-col justify-end gap-5 p-6 md:p-12 lg:p-16">
        <RevealHeading id="lookbook-title">{lookbook.name}</RevealHeading>
        {lookbook.description ? <p className="type-lead max-w-[46ch]">{lookbook.description}</p> : null}
        <Link
          href={`/collections/${lookbook.slug}`}
          className="type-label inline-flex h-12 w-fit items-center bg-ink px-6 text-chalk transition-colors duration-300 hover:bg-ink/80"
        >
          Shop the looks
        </Link>
      </div>
    </section>
  );
}
