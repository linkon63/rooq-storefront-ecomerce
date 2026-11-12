import type { Metadata } from "next";
import { ShopListing } from "@/components/storefront/shop/shop-listing";
import { shopTitle, type RawSearchParams } from "@/utils/storefront/shop-query";

type PageProps = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const title = shopTitle(await searchParams);
  return { title, description: `${title} at Rooq: clothing, footwear and accessories. Filter by size, colour, fit and price.` };
}

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <ShopListing title={shopTitle(params)} basePath="/shop" searchParams={params} />;
}
