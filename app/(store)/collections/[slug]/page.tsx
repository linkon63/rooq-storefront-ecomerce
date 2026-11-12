import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { LookSection } from "@/components/storefront/collections/look-section";
import { ProductGrid } from "@/components/storefront/product-card/product-grid";
import { Breadcrumbs } from "@/components/storefront/shared/breadcrumbs";
import { EmptyState } from "@/components/storefront/shared/empty-state";
import { Pagination } from "@/components/storefront/shop/pagination";
import { getCollectionBySlug } from "@/lib/storefront/catalog-data";
import { pageFromParam } from "@/utils/storefront/pages";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const collection = await getCollectionBySlug((await params).slug, 1);
  if (!collection) return { title: "Not found" };
  return {
    title: collection.metaTitle ?? collection.name,
    description: collection.metaDescription ?? collection.description ?? undefined,
    openGraph: collection.coverImageUrl ? { images: [{ url: collection.coverImageUrl }] } : undefined,
  };
}

/** A collection grid, or a lookbook: looks first ("shop the look"), then every piece. */
export default async function CollectionPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const page = pageFromParam(query.page);
  const collection = await getCollectionBySlug(slug, page);
  if (!collection) notFound();
  const looks = [...collection.looks].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-16 pt-4 md:pt-6">
      <header className="page-gutter flex flex-col gap-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Collections", href: "/collections" }, { label: collection.name }]} />
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <div className="flex flex-col gap-3">
            <h1 className="font-display font-expanded text-[clamp(2.25rem,8vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.02em]">{collection.name}</h1>
            {collection.description ? <p className="max-w-[56ch] text-stone">{collection.description}</p> : null}
          </div>
          {collection.coverImageUrl ? (
            <div className="relative aspect-[16/10] overflow-hidden bg-selvedge">
              <Image src={collection.coverImageUrl} alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
          ) : null}
        </div>
      </header>

      {page === 1 && looks.length ? (
        <div className="page-gutter flex flex-col gap-16">
          {looks.map((look, index) => (
            <LookSection key={look.id} look={look} index={index} />
          ))}
        </div>
      ) : null}

      <section aria-labelledby="all-pieces" className="page-gutter">
        <h2 id="all-pieces" className="mb-6 font-wide text-2xl font-bold">
          {looks.length ? "Every piece" : `${collection.productCount} pieces`}
        </h2>
        {collection.products.length ? (
          <>
            <ProductGrid products={collection.products} />
            {collection.meta ? <Pagination meta={collection.meta} hrefFor={(next) => `/collections/${collection.slug}${next > 1 ? `?page=${next}` : ""}`} /> : null}
          </>
        ) : (
          <EmptyState title="Nothing here yet" body="Pieces are being added to this collection." action={{ label: "Shop new in", href: "/new" }} />
        )}
      </section>
    </div>
  );
}
