import Image from "next/image";
import Link from "next/link";
import { COLLECTION_TYPE_LABELS } from "@/lib/constants/catalog";
import type { CollectionSummary } from "@/types/storefront/catalog";

/** Cover image with name and piece count; lookbooks say so. */
export function CollectionCard({ collection, sizes = "(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 90vw" }: { collection: CollectionSummary; sizes?: string }) {
  return (
    <Link href={`/collections/${collection.slug}`} className="group flex flex-col gap-3">
      <span className="relative block aspect-[4/5] overflow-hidden bg-selvedge">
        {collection.coverImageUrl ? (
          <Image
            src={collection.coverImageUrl}
            alt=""
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-[var(--ease-cloth)] group-hover:scale-[1.03]"
          />
        ) : (
          <span aria-hidden className="absolute inset-0 grid place-items-center font-expanded text-4xl font-extrabold text-ink/15">
            {collection.name.slice(0, 1)}
          </span>
        )}
      </span>
      <span>
        <span className="block font-wide text-lg font-bold leading-tight group-hover:underline">{collection.name}</span>
        <span className="text-sm text-stone">
          {collection.type === "LOOKBOOK" ? `${COLLECTION_TYPE_LABELS.LOOKBOOK}, ` : ""}
          {collection.productCount} pieces
        </span>
      </span>
    </Link>
  );
}
