import type { Metadata } from "next";
import { ShopListing } from "@/components/storefront/shop/shop-listing";
import type { RawSearchParams } from "@/utils/storefront/shop-query";

export const metadata: Metadata = {
  title: "New Saree Collection in BD",
  description: "New saree (sharee) arrivals at Rooq, newest first. Shop the latest BD sharee online.",
  alternates: { canonical: "/new" },
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
