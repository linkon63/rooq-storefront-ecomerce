/** Pure mapping between GET /settings and the General settings form. */

export type GeneralSettingsSource = {
  shopName?: string;
  currency?: string;
  language?: string;
  slogan?: string | null;
  footerDescription?: string | null;
  parentCompany?: string | null;
  parentCompanyLink?: string | null;
  showCertifications?: boolean;
  isTopBarVisible?: boolean;
  hideOutOfStock?: boolean;
  deliveryChargeInside?: number | string | null;
  deliveryChargeNearCity?: number | string | null;
  deliveryChargeOutside?: number | string | null;
  freeShippingThreshold?: number | null;
  returnWindowDays?: number;
  lowStockThreshold?: number;
};

/** Every field is a string or boolean so inputs stay controlled. */
export type GeneralForm = {
  shopName: string;
  currency: string;
  language: string;
  slogan: string;
  footerDescription: string;
  parentCompany: string;
  parentCompanyLink: string;
  showCertifications: boolean;
  isTopBarVisible: boolean;
  hideOutOfStock: boolean;
  deliveryChargeInside: string;
  deliveryChargeNearCity: string;
  deliveryChargeOutside: string;
  freeShippingThreshold: string;
  returnWindowDays: string;
  lowStockThreshold: string;
};

export const EMPTY_GENERAL_FORM: GeneralForm = {
  shopName: "",
  currency: "BDT",
  language: "en",
  slogan: "",
  footerDescription: "",
  parentCompany: "",
  parentCompanyLink: "",
  showCertifications: false,
  isTopBarVisible: true,
  hideOutOfStock: false,
  deliveryChargeInside: "",
  deliveryChargeNearCity: "",
  deliveryChargeOutside: "",
  freeShippingThreshold: "",
  returnWindowDays: "14",
  lowStockThreshold: "5",
};

const str = (value: number | string | null | undefined) => (value === null || value === undefined ? "" : String(value));

export function toGeneralForm(source: GeneralSettingsSource): GeneralForm {
  return {
    shopName: source.shopName ?? "",
    currency: source.currency ?? "BDT",
    language: source.language ?? "en",
    slogan: source.slogan ?? "",
    footerDescription: source.footerDescription ?? "",
    parentCompany: source.parentCompany ?? "",
    parentCompanyLink: source.parentCompanyLink ?? "",
    showCertifications: source.showCertifications ?? false,
    isTopBarVisible: source.isTopBarVisible ?? true,
    hideOutOfStock: source.hideOutOfStock ?? false,
    deliveryChargeInside: str(source.deliveryChargeInside),
    deliveryChargeNearCity: str(source.deliveryChargeNearCity),
    deliveryChargeOutside: str(source.deliveryChargeOutside),
    freeShippingThreshold: str(source.freeShippingThreshold),
    returnWindowDays: str(source.returnWindowDays ?? 14),
    lowStockThreshold: str(source.lowStockThreshold ?? 5),
  };
}

const num = (value: string, fallback = 0) => (value.trim() === "" ? fallback : Number(value));

/** PATCH /settings body for the General page. */
export function toGeneralPayload(form: GeneralForm) {
  return {
    shopName: form.shopName.trim(),
    currency: form.currency,
    language: form.language,
    slogan: form.slogan.trim() || null,
    footerDescription: form.footerDescription.trim() || null,
    parentCompany: form.parentCompany.trim() || null,
    parentCompanyLink: form.parentCompanyLink.trim() || null,
    showCertifications: form.showCertifications,
    isTopBarVisible: form.isTopBarVisible,
    hideOutOfStock: form.hideOutOfStock,
    deliveryChargeInside: num(form.deliveryChargeInside),
    deliveryChargeNearCity: num(form.deliveryChargeNearCity),
    deliveryChargeOutside: num(form.deliveryChargeOutside),
    freeShippingThreshold: form.freeShippingThreshold.trim() === "" ? null : Number(form.freeShippingThreshold),
    returnWindowDays: Math.round(num(form.returnWindowDays, 14)),
    lowStockThreshold: Math.round(num(form.lowStockThreshold, 5)),
  };
}
