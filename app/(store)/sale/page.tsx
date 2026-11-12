import type { Metadata } from "next";
import { ShopListing } from "@/components/storefront/shop/shop-listing";
import type { RawSearchParams } from "@/utils/storefront/shop-query";

export const metadata: Metadata = {
  title: "Sale",
  description: "Reduced pieces at Rooq while sizes last.",
};

const PRESET = { onSale: true } as const;

export default async function SalePage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return (
    <ShopListing
      title="Sale"
      intro="Reduced while sizes last. Filter by your size to see only what is left in it."
      basePath="/sale"
      searchParams={await searchParams}
      preset={PRESET}
    />
  );
}
