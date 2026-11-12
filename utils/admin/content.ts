import type { Campaign, ProductOption } from "@/types/admin/content";

/** Every image URL of a campaign, whichever shape the API answered with. */
export function campaignImageUrls(campaign: Pick<Campaign, "imageUrls" | "images">): string[] {
  if (campaign.imageUrls) return campaign.imageUrls;
  return (campaign.images ?? []).flatMap((entry) => entry.images ?? []);
}

/** Thumbnail of a product option — the new `image`, or the old gallery shape. */
export function productOptionImage(product: ProductOption): string | null {
  return product.image?.url ?? product.media?.[0]?.media?.url ?? null;
}
