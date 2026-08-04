import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetails from "@/components/storefront/shop/ProductDetails";
import RelatedProducts from "@/components/storefront/shop/RelatedProducts";
import { fetchShopProductById, fetchShopProducts } from "@/lib/shop-api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchShopProductById(id);

  if (!product) return { title: "Product not found | Organishi" };

  return {
    title: product.metaTitle ?? `${product.name} | Organishi`,
    description: product.metaDescription ?? product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;

  const product = await fetchShopProductById(id);
  if (!product) notFound();

  // "You may also like" — same category, minus the product being viewed.
  const { data: siblings } = await fetchShopProducts({
    limit: 12,
    categoryId: product.categoryId,
  });
  const related = siblings.filter((item) => item.id !== product.id).slice(0, 4);

  return (
    <>
      <ProductDetails product={product} />
      {related.length > 0 && <RelatedProducts title="You May Also Like" products={related} />}
    </>
  );
}
