import "server-only";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { ActiveStatus } from "@/lib/generated/prisma/enums";
import { formBoolean } from "@/utils/form-fields";
import { parseImageList } from "@/utils/mappers/campaign";
import { dateString } from "../product-discounts/schemas";

const v = ERROR_MESSAGES.validation;
const emptyToNull = (value: unknown) => (value === "" ? null : value);
const optionalText = z.preprocess(emptyToNull, z.string().trim().nullable().optional());

/** Image URLs / media ids to keep, as a JSON string (multipart) or an array (JSON). */
const imageList = z.unknown().transform((value, ctx) => {
  const list = parseImageList(value);
  if (list === null) {
    ctx.addIssue({ code: "custom", message: ERROR_MESSAGES.campaign.invalidKeepImages });
    return z.NEVER;
  }
  return list;
});

/** POST /campaigns — CreateCampaignDto (multipart text fields or JSON). */
export const createCampaignSchema = z.strictObject({
  title: z.string({ error: v.required("title") }).trim().min(1, v.required("title")),
  description: optionalText,
  linkUrl: optionalText,
  linkLabel: optionalText,
  sectionId: z.uuid({ error: v.invalidUuid("sectionId") }),
  hasDiscount: z.preprocess(formBoolean, z.boolean().optional()),
  /** "" / null clears the link — the admin form always sends this field. */
  discountId: z.preprocess(emptyToNull, z.uuid({ error: v.invalidUuid("discountId") }).nullable().optional()),
  startAt: dateString("startAt").optional(),
  endAt: z.preprocess(emptyToNull, dateString("endAt").nullable().optional()),
  status: z.enum(ActiveStatus).optional(),
  /** Images already stored (from POST /upload, or kept on update). */
  keepImages: imageList.optional(),
});
export type CreateCampaignInput = z.output<typeof createCampaignSchema>;

/** PATCH /campaigns/:id — PartialType(CreateCampaignDto) + keepImages. */
export const updateCampaignSchema = createCampaignSchema.partial();
export type UpdateCampaignInput = z.output<typeof updateCampaignSchema>;

/** PATCH /campaigns/:id/status — UpdateCampaignStatusDto */
export const campaignStatusSchema = z.strictObject({ status: z.enum(ActiveStatus) });
export type CampaignStatusInput = z.output<typeof campaignStatusSchema>;
