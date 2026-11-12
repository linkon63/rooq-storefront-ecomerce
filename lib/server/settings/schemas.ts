import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SOCIAL_PLATFORMS } from "@/utils/mappers/settings";

const v = ERROR_MESSAGES.validation;
const text = z.string().trim().nullish();
const money = z.coerce.number().min(0).nullish();
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, ERROR_MESSAGES.settings.invalidTime)
  .or(z.literal(""))
  .nullish();
const mediaId = (field: string) => z.uuid({ error: v.invalidUuid(field) }).nullish();

const contactEntry = z.object({ title: z.string().nullish(), value: z.string().nullish() });
/** `{ entries: [...] }` (the admin's shape) or a bare array. */
const contactJson = z
  .union([z.object({ entries: z.array(contactEntry) }), z.array(contactEntry)])
  .transform((value) => (Array.isArray(value) ? value : value.entries))
  .nullish();

const socialContact = z
  .partialRecord(z.enum(SOCIAL_PLATFORMS), z.string().trim().nullish())
  .nullish();

/** PATCH /settings — UpdateSettingDto (every field optional). */
export const updateSettingsSchema = z.strictObject({
  shopName: text,
  slogan: text,
  footerDescription: text,
  branchName: text,
  branchAddress: text,
  branchLat: z.number().nullish(),
  branchLng: z.number().nullish(),
  /** Ignored — always set to the current year, as before. */
  copyrightYear: text,
  parentCompany: text,
  parentCompanyLink: text,
  openingTime: time,
  closingTime: time,
  currency: text,
  language: text,
  showCertifications: z.boolean().optional(),
  isTopBarVisible: z.boolean().optional(),
  hideOutOfStock: z.boolean().optional(),

  deliveryChargeInside: money,
  deliveryChargeNearCity: money,
  deliveryChargeOutside: money,
  freeShippingThreshold: money,
  returnWindowDays: z.coerce.number().int().min(0).max(365).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),

  fraudCheckApiKey: text,
  isFraudChecking: z.boolean().optional(),
  fraudCheckingThreshold: z.coerce.number().int().min(0).optional(),
  fraudCheckingSuccessRate: z.coerce.number().min(0).max(100).nullish(),

  contactNumber: contactJson,
  email: contactJson,
  socialContact,

  youtubeUrl: text,
  youtubeTitle: text,
  youtubeDescription: text,
  youtubeMetaData: z.record(z.string(), z.unknown()).nullish(),

  /** Image URLs from POST /upload ("/api/v1/media/<id>"); "" or null clears. */
  logo: text,
  icon: text,
  favicon: text,
  youtubeThumbnailImage: text,
  /** …or the media ids directly. */
  logoMediaId: mediaId("logoMediaId"),
  iconMediaId: mediaId("iconMediaId"),
  faviconMediaId: mediaId("faviconMediaId"),
  youtubeThumbMediaId: mediaId("youtubeThumbMediaId"),
});

export type UpdateSettingsInput = z.output<typeof updateSettingsSchema>;
