// ─── Settings ──────────────────────────────────────────────────────────────

export type SettingsContactEntry = { title: string; value: string };

/**
 * The API stores contactNumber and email as a JSON object with an "entries" array.
 * Shape on the wire: { entries: SettingsContactEntry[] }
 * We flatten/unflatten on the frontend for array-based editing.
 */
export type SettingsContactJson = { entries: SettingsContactEntry[] };

export type SettingsSocialContact = {
  tiktok?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  pinterest?: string;
};

/** Shape returned by GET /settings */
export type AppSettings = {
  id?: string;
  shopName?: string;
  logo?: string | null;
  icon?: string | null;
  favicon?: string | null;
  slogan?: string | null;
  /** Paragraph under the logo in the storefront footer. */
  footerDescription?: string | null;
  /** Business hours as 24-hour "HH:mm" strings — the storefront formats them. */
  openingTime?: string | null;
  closingTime?: string | null;
  /** Homepage certification strip — on unless switched off in General. */
  showCertifications?: boolean;
  isTopBarVisible?: boolean;
  hideOutOfStock?: boolean;
  branchName?: string | null;
  branchAddress?: string | null;
  branchLat?: number | null;
  branchLng?: number | null;
  /** Raw JSON from API — { entries: [...] } */
  contactNumber?: SettingsContactJson | null;
  /** Raw JSON from API — { entries: [...] } */
  email?: SettingsContactJson | null;
  socialContact?: SettingsSocialContact | null;
  currency?: string;
  language?: string;
  copyrightYear?: string | null;
  parentCompany?: string | null;
  parentCompanyLink?: string | null;
  deliveryChargeInside?: number | string | null;
  deliveryChargeOutside?: number | string | null;
  deliveryChargeNearCity?: number | string | null;
  /** Orders at or above this subtotal ship free; null = never. */
  freeShippingThreshold?: number | null;
  /** Days after delivery a customer may request a return / exchange. */
  returnWindowDays?: number;
  /** Default low-stock threshold for new variants and dashboard alerts. */
  lowStockThreshold?: number;
  /** Media ids behind logo / icon / favicon (images live in the database). */
  logoMediaId?: string | null;
  iconMediaId?: string | null;
  faviconMediaId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// ─── Policies ──────────────────────────────────────────────────────────────

export type PolicyEntry = { title: string; content: string };

export type AppPolicies = {
  id?: string;
  delivery?: PolicyEntry;
  refund?: PolicyEntry;
  return?: PolicyEntry;
  cancellation?: PolicyEntry;
  privacy?: PolicyEntry;
  terms?: PolicyEntry;
  createdAt?: string;
  updatedAt?: string;
};

export type UploadedImage = { url: string; id: string; width: number | null; height: number | null };
