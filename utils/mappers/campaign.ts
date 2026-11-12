import { toImages, type ImageResponse, type MediaImageRow } from "./content-image";

export type CampaignSectionRow = {
  id: string;
  title: string;
  page: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
};

/** Row produced by `campaignSelect` (lib/server/campaigns/select.ts); `D` is the mapped discount. */
export type CampaignRow = {
  id: string;
  title: string;
  description: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  hasDiscount: boolean;
  status: "active" | "inactive";
  startAt: Date;
  endAt: Date | null;
  sectionId: string;
  discountId: string | null;
  createdAt: Date;
  updatedAt: Date;
  section: CampaignSectionRow;
  media: { position: number; media: MediaImageRow }[];
};

export type CampaignResponse<D> = Omit<CampaignRow, "media"> & {
  /** Old shape the storefront and admin read: one entry holding every URL. */
  images: { id: string; images: string[] }[];
  imageUrls: string[];
  media: ImageResponse[];
  discount: D | null;
};

export function toCampaignResponse<D>(row: CampaignRow, discount: D | null): CampaignResponse<D> {
  const { media: rows, ...rest } = row;
  const media = toImages(rows);
  const imageUrls = media.map((image) => image.url);
  return {
    ...rest,
    images: imageUrls.length > 0 ? [{ id: row.id, images: imageUrls }] : [],
    imageUrls,
    media,
    discount,
  };
}

/** The old normaliseDiscountId: multipart sends "" for an unset select. */
export function normaliseDiscountId(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** A campaign is live when active and `now` falls inside its window. */
export function isCampaignLive(campaign: { status: string; startAt: Date; endAt: Date | null }, now: Date): boolean {
  if (campaign.status !== "active") return false;
  if (campaign.startAt.getTime() > now.getTime()) return false;
  return !campaign.endAt || campaign.endAt.getTime() >= now.getTime();
}

/** Parses the `keepImages` JSON array (or passes an array through); null when malformed. */
export function parseImageList(value: unknown): string[] | null {
  let parsed: unknown = value;
  if (typeof value === "string") {
    if (value.trim() === "") return [];
    try {
      parsed = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) return null;
  return parsed;
}
