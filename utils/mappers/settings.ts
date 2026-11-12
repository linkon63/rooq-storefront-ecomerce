import { mediaSrc, type MediaRef } from "@/utils/media-url";
import { toNumber, toNumberOrNull, type DecimalLike } from "@/utils/decimal";

export const SOCIAL_PLATFORMS = [
  "facebook",
  "instagram",
  "tiktok",
  "twitter",
  "linkedin",
  "youtube",
  "pinterest",
] as const;
export type SocialPlatformKey = (typeof SOCIAL_PLATFORMS)[number];

export type ContactEntry = { title: string; value: string };
/** Wire shape the admin + storefront already read: `{ entries: [...] }`. */
export type ContactJson = { entries: ContactEntry[] };
export type SocialContact = Partial<Record<SocialPlatformKey, string>>;

/** Row produced by `settingsSelect` (lib/server/settings/select.ts). */
export type SettingRow = {
  id: string;
  shopName: string;
  slogan: string | null;
  footerDescription: string | null;
  branchName: string | null;
  branchAddress: string | null;
  branchLat: number | null;
  branchLng: number | null;
  copyrightYear: string | null;
  parentCompany: string | null;
  parentCompanyLink: string | null;
  openingTime: string | null;
  closingTime: string | null;
  currency: string;
  language: string;
  showCertifications: boolean;
  isTopBarVisible: boolean;
  hideOutOfStock: boolean;
  deliveryChargeInside: DecimalLike;
  deliveryChargeNearCity: DecimalLike;
  deliveryChargeOutside: DecimalLike;
  freeShippingThreshold: DecimalLike;
  returnWindowDays: number;
  lowStockThreshold: number;
  fraudCheckApiKey: string | null;
  isFraudChecking: boolean;
  fraudCheckingThreshold: number;
  fraudCheckingSuccessRate: DecimalLike;
  youtubeUrl: string | null;
  youtubeTitle: string | null;
  youtubeDescription: string | null;
  youtubeMetaData: unknown;
  logoMediaId: string | null;
  iconMediaId: string | null;
  faviconMediaId: string | null;
  youtubeThumbMediaId: string | null;
  logoMedia: MediaRef | null;
  iconMedia: MediaRef | null;
  faviconMedia: MediaRef | null;
  youtubeThumbMedia: MediaRef | null;
  contacts: { kind: "PHONE" | "EMAIL"; title: string; value: string; position: number }[];
  socialLinks: { platform: SocialPlatformKey; url: string }[];
  createdAt: Date;
  updatedAt: Date;
};

export type SettingsResponse = {
  id: string;
  shopName: string;
  slogan: string | null;
  footerDescription: string | null;
  branchName: string | null;
  branchAddress: string | null;
  branchLat: number | null;
  branchLng: number | null;
  copyrightYear: string | null;
  parentCompany: string | null;
  parentCompanyLink: string | null;
  openingTime: string | null;
  closingTime: string | null;
  currency: string;
  language: string;
  showCertifications: boolean;
  isTopBarVisible: boolean;
  hideOutOfStock: boolean;
  deliveryChargeInside: number;
  deliveryChargeNearCity: number;
  deliveryChargeOutside: number;
  freeShippingThreshold: number | null;
  returnWindowDays: number;
  lowStockThreshold: number;
  /** Only present for staff — never sent to the storefront. */
  fraudCheckApiKey?: string | null;
  isFraudChecking: boolean;
  fraudCheckingThreshold: number;
  fraudCheckingSuccessRate: number | null;
  youtubeUrl: string | null;
  youtubeTitle: string | null;
  youtubeDescription: string | null;
  youtubeMetaData: unknown;
  youtubeThumbnailImage: string | null;
  logo: string | null;
  icon: string | null;
  favicon: string | null;
  logoMediaId: string | null;
  iconMediaId: string | null;
  faviconMediaId: string | null;
  youtubeThumbMediaId: string | null;
  contactNumber: ContactJson;
  email: ContactJson;
  socialContact: SocialContact;
  createdAt: Date;
  updatedAt: Date;
};

function contactJson(row: SettingRow, kind: "PHONE" | "EMAIL"): ContactJson {
  return {
    entries: row.contacts
      .filter((contact) => contact.kind === kind)
      .sort((a, b) => a.position - b.position)
      .map(({ title, value }) => ({ title, value })),
  };
}

function socialContact(row: SettingRow): SocialContact {
  const out: SocialContact = {};
  for (const link of row.socialLinks) out[link.platform] = link.url;
  return out;
}

export function toSettingsResponse(row: SettingRow, options: { includeSecrets?: boolean } = {}): SettingsResponse {
  const response: SettingsResponse = {
    id: row.id,
    shopName: row.shopName,
    slogan: row.slogan,
    footerDescription: row.footerDescription,
    branchName: row.branchName,
    branchAddress: row.branchAddress,
    branchLat: row.branchLat,
    branchLng: row.branchLng,
    copyrightYear: row.copyrightYear,
    parentCompany: row.parentCompany,
    parentCompanyLink: row.parentCompanyLink,
    openingTime: row.openingTime,
    closingTime: row.closingTime,
    currency: row.currency,
    language: row.language,
    showCertifications: row.showCertifications,
    isTopBarVisible: row.isTopBarVisible,
    hideOutOfStock: row.hideOutOfStock,
    deliveryChargeInside: toNumber(row.deliveryChargeInside),
    deliveryChargeNearCity: toNumber(row.deliveryChargeNearCity),
    deliveryChargeOutside: toNumber(row.deliveryChargeOutside),
    freeShippingThreshold: toNumberOrNull(row.freeShippingThreshold),
    returnWindowDays: row.returnWindowDays,
    lowStockThreshold: row.lowStockThreshold,
    isFraudChecking: row.isFraudChecking,
    fraudCheckingThreshold: row.fraudCheckingThreshold,
    fraudCheckingSuccessRate: toNumberOrNull(row.fraudCheckingSuccessRate),
    youtubeUrl: row.youtubeUrl,
    youtubeTitle: row.youtubeTitle,
    youtubeDescription: row.youtubeDescription,
    youtubeMetaData: row.youtubeMetaData ?? null,
    youtubeThumbnailImage: mediaSrc(row.youtubeThumbMedia),
    logo: mediaSrc(row.logoMedia),
    icon: mediaSrc(row.iconMedia),
    favicon: mediaSrc(row.faviconMedia),
    logoMediaId: row.logoMediaId,
    iconMediaId: row.iconMediaId,
    faviconMediaId: row.faviconMediaId,
    youtubeThumbMediaId: row.youtubeThumbMediaId,
    contactNumber: contactJson(row, "PHONE"),
    email: contactJson(row, "EMAIL"),
    socialContact: socialContact(row),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  if (options.includeSecrets) response.fraudCheckApiKey = row.fraudCheckApiKey;
  return response;
}

/** Drops blank `{ title, value }` rows the admin form seeds. */
export function cleanContactEntries(entries: readonly { title?: string | null; value?: string | null }[]): ContactEntry[] {
  return entries
    .map((entry) => ({ title: (entry.title ?? "").trim(), value: (entry.value ?? "").trim() }))
    .filter((entry) => entry.value.length > 0);
}
