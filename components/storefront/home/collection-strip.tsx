import type { CollectionSummary } from "@/types/storefront/catalog";
import { CollectionCard } from "../collections/collection-card";
import { RevealHeading } from "./reveal-heading";
import Link from "next/link";

/** Featured collections as a swipeable row on phones, a grid on desktop. */
export function CollectionStrip({ collections }: { collections: CollectionSummary[] }) {
  if (collections.length === 0) return null;
  return (
    <section aria-labelledby="collections-title" className="page-gutter">
      <div className="mb-8 flex items-end justify-between gap-4">
        <RevealHeading id="collections-title">Collections</RevealHeading>
        <Link href="/collections" className="shrink-0 text-sm font-medium underline underline-offset-4 hover:text-dye-deep">
          All collections
        </Link>
      </div>
      <ul className="rail-scroll -mx-4 flex gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {collections.slice(0, 3).map((collection) => (
          <li key={collection.id} className="w-[78%] shrink-0 md:w-auto">
            <CollectionCard collection={collection} />
          </li>
        ))}
      </ul>
    </section>
  );
}
