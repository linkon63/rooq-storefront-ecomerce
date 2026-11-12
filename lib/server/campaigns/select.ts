import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { mediaRefSelect } from "../media/select";
import { productDiscountDetailSelect, productDiscountSelect } from "../product-discounts/select";

const campaignBase = {
  id: true,
  title: true,
  description: true,
  linkUrl: true,
  linkLabel: true,
  hasDiscount: true,
  status: true,
  startAt: true,
  endAt: true,
  sectionId: true,
  discountId: true,
  createdAt: true,
  updatedAt: true,
  section: true,
  media: { select: { position: true, media: { select: mediaRefSelect } }, orderBy: { position: "asc" } },
} satisfies Prisma.CampaignSelect;

/** Lists: the discount summary only. */
export const campaignListSelect = {
  ...campaignBase,
  discount: { select: productDiscountSelect },
} satisfies Prisma.CampaignSelect;

/** Detail / writes: the discount with its products, as the old include did. */
export const campaignDetailSelect = {
  ...campaignBase,
  discount: { select: productDiscountDetailSelect },
} satisfies Prisma.CampaignSelect;
