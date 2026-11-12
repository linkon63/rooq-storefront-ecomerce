import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ProductRail } from "@/components/storefront/product-card/product-rail";
import { RecentlyViewedRail } from "@/components/storefront/product-card/recently-viewed-rail";
import { ProductDetails } from "@/components/storefront/product/product-details";
import { ProductView } from "@/components/storefront/product/product-view";
import { ReviewsSection } from "@/components/storefront/reviews/reviews-section";
import { Breadcrumbs } from "@/components/storefront/shared/breadcrumbs";
import { SITE_URL } from "@/lib/constants/storefront";
import { getProductById, getProductBySlug, getStoreSettings } from "@/lib/storefront/catalog-data";
import { leadImageUrl, looksLikeId, productJsonLd } from "@/utils/storefront/product-seo";
import { clientProduct } from "@/utils/storefront/product-view";

type PageProps = { params: Promise<{ slug: string }> };

async function loadProduct(slug: string) {
  return looksLikeId(slug) ? getProductById(slug) : getProductBySlug(slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await loadProduct((await params).slug);
  if (!product) return { title: "Not found" };
  const image = leadImageUrl(product);
  const description = product.seo.metaDescription ?? product.shortDescription ?? `${product.name} by ${product.brand.name} at Rooq.`;
  return {
    title: product.seo.metaTitle ?? product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.name, description, images: image ? [{ url: image }] : undefined },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([loadProduct(slug), getStoreSettings()]);
  if (!product) notFound();
  if (product.slug !== slug) permanentRedirect(`/product/${product.slug}`);

  const viewProduct = clientProduct(product);
  const reviewProduct = {
    id: product.id,
    name: product.name,
    colors: product.colors.map(({ id, name }) => ({ id, name })),
    sizes: product.sizes,
    variants: product.variants,
  };

  const crumbs = [
    { label: "Home", href: "/" },
    ...product.breadcrumbs.map((crumb) => ({ label: crumb.name, href: `/shop?category=${encodeURIComponent(crumb.slug)}` })),
    { label: product.name },
  ];

  return (
    <div className="flex flex-col gap-20 pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, SITE_URL, settings.currency)).replace(/</g, "\\u003c") }}
      />
      <div className="page-gutter pt-4 md:pt-6">
        <div className="mb-4 md:mb-6">
          <Breadcrumbs items={crumbs} />
        </div>
        <ProductView product={viewProduct} details={<ProductDetails product={product} currency={settings.currency} />} />
      </div>
      <ProductRail title="Complete the look" products={product.completeTheLook} />
      <div className="page-gutter">
        <ReviewsSection product={reviewProduct} />
      </div>
      <ProductRail title="You may also like" products={product.related} />
      <RecentlyViewedRail excludeId={product.id} />
    </div>
  );
}
