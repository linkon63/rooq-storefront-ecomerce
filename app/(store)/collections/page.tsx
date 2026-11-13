import type { Metadata } from "next";
import { CollectionCard } from "@/components/storefront/collections/collection-card";
import { EmptyState } from "@/components/storefront/shared/empty-state";
import { listCollections } from "@/lib/storefront/catalog-data";

export const metadata: Metadata = {
  title: "Collections and lookbooks",
  description: "Curated Rooq collections and lookbooks. Shop a whole look in one go.",
};

export default async function CollectionsPage() {
  const [lookbooks, collections] = await Promise.all([
    listCollections({ type: "LOOKBOOK" }),
    listCollections({ type: "COLLECTION" }),
  ]);

  return (
    <div className="page-gutter flex flex-col gap-16 pt-8 md:pt-12">
      <h1 className="font-display font-expanded text-[clamp(2rem,7vw,3.5rem)] font-extrabold leading-none tracking-[-0.02em]">
        Collections
      </h1>
      {lookbooks.length === 0 && collections.length === 0 ? (
        <EmptyState title="No collections yet" body="The first edit is on its way. Meanwhile, see what is new." action={{ label: "Shop new in", href: "/new" }} />
      ) : null}
      {lookbooks.length ? (
        <section aria-labelledby="lookbooks-title">
          <h2 id="lookbooks-title" className="type-h2 section-head">
            Lookbooks
          </h2>
          <ul className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {lookbooks.map((collection) => (
              <li key={collection.id}>
                <CollectionCard collection={collection} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {collections.length ? (
        <section aria-labelledby="edits-title">
          <h2 id="edits-title" className="type-h2 section-head">
            Edits
          </h2>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4">
            {collections.map((collection) => (
              <li key={collection.id}>
                <CollectionCard collection={collection} sizes="(min-width: 1024px) 24vw, 48vw" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
