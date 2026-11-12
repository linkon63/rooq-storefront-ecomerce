import type { Metadata } from "next";
import { ShopListing } from "@/components/storefront/shop/shop-listing";
import type { RawSearchParams } from "@/utils/storefront/shop-query";

export const metadata: Metadata = {
  title: "New in",
  description: "The latest arrivals at Rooq, newest first.",
};

const PRESET = { isNew: true } as const;

export default async function NewArrivalsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return (
    <ShopListing
      title="New in"
      intro="Everything that landed in the last 30 days, newest first."
      basePath="/new"
      searchParams={await searchParams}
      preset={PRESET}
    />
  );
}
