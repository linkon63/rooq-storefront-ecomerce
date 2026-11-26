import type { Metadata } from "next";
import { ShopListing } from "@/components/storefront/shop/shop-listing";
import { getCategoryTree } from "@/lib/storefront/catalog-data";
import { shopMetadata } from "@/utils/storefront/shop-seo";
import { parseShopFilters, shopTitle, type RawSearchParams } from "@/utils/storefront/shop-query";

type PageProps = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const { category, search } = parseShopFilters(params);
  const roots = category.length === 1 ? await getCategoryTree() : [];
  const match = roots.flatMap((root) => [root, ...(root.children ?? [])]).find((node) => node.slug === category[0]);
  return {
    ...shopMetadata(shopTitle(params), match?.name),
    alternates: { canonical: match ? `/shop?category=${encodeURIComponent(match.slug)}` : "/shop" },
    // Search results are endless variations of the same list.
    robots: search ? { index: false, follow: true } : undefined,
  };
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <ShopListing title={shopTitle(params)} basePath="/shop" searchParams={params} />;
}
