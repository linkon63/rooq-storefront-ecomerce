import { listCollections, productRail } from "@/lib/storefront/catalog-data";
import { CollectionHighlights } from "./collection-highlights";

const HIGHLIGHTS_PER_COLLECTION = 2;

/** Loads featured collections and each one's two newest pieces (streams in behind Suspense). */
export async function FeaturedCollections() {
  const collections = await listCollections({ type: "COLLECTION", featured: true });
  const items = await Promise.all(
    collections.slice(0, 3).map(async (collection) => ({
      collection,
      products: (await productRail({ collection: collection.slug, sort: "newest", limit: HIGHLIGHTS_PER_COLLECTION })).data,
    })),
  );
  return <CollectionHighlights items={items} />;
}
