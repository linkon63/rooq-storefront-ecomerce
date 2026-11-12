import type { Department, Fit, Occasion, Pattern, ProductStatus, Season } from "@/lib/generated/prisma/enums";
import { linesToList, numberOrNull, textOrNull } from "./form-values";

export type ProductFormState = {
  name: string; slug: string; styleCode: string; status: ProductStatus; isFeatured: boolean;
  shortDescription: string; description: string;
  brandId: string; categoryId: string; department: Department; unitId: string; supplierId: string; sizeChartId: string;
  tagIds: string[]; collectionIds: string[]; attributeValueIds: string[];
  material: string; composition: string; careInstructions: string; fit: Fit | ""; season: Season | ""; pattern: Pattern | "";
  occasions: Occasion[]; modelInfo: string; features: string;
  price: string; compareAtPrice: string; costPrice: string;
  metaTitle: string; metaDescription: string; metaKeywords: string;
};

/** The admin product read, narrowed to what the form prefills from. */
export type ProductFormSource = {
  name: string; slug: string; styleCode: string | null; status: ProductStatus; isFeatured: boolean;
  shortDescription: string | null; description: string | null; department: Department;
  material: string | null; composition: string | null; careInstructions: string | null;
  fit: Fit | null; season: Season | null; pattern: Pattern | null; occasions: Occasion[]; modelInfo: string | null; features: string[];
  metaTitle: string | null; metaDescription: string | null; metaKeywords: string | null;
  brandId?: string; categoryId?: string; unitId?: string | null; supplierId?: string | null; sizeChartId?: string | null;
  tagIds?: string[]; collectionIds?: string[]; attributeValueIds?: string[];
  basePrice?: number | null; baseCompareAtPrice?: number | null; costPrice?: number | null;
};

export const EMPTY_PRODUCT_FORM: ProductFormState = {
  name: "", slug: "", styleCode: "", status: "draft", isFeatured: false, shortDescription: "", description: "",
  brandId: "", categoryId: "", department: "UNISEX", unitId: "", supplierId: "", sizeChartId: "",
  tagIds: [], collectionIds: [], attributeValueIds: [],
  material: "", composition: "", careInstructions: "", fit: "", season: "", pattern: "", occasions: [], modelInfo: "", features: "",
  price: "", compareAtPrice: "", costPrice: "", metaTitle: "", metaDescription: "", metaKeywords: "",
};

const str = (value: string | null | undefined) => value ?? "";
const num = (value: number | null | undefined) => (value === null || value === undefined ? "" : String(value));

export function productToForm(p: ProductFormSource): ProductFormState {
  return {
    name: p.name, slug: p.slug, styleCode: str(p.styleCode), status: p.status, isFeatured: p.isFeatured,
    shortDescription: str(p.shortDescription), description: str(p.description),
    brandId: str(p.brandId), categoryId: str(p.categoryId), department: p.department,
    unitId: str(p.unitId), supplierId: str(p.supplierId), sizeChartId: str(p.sizeChartId),
    tagIds: p.tagIds ?? [], collectionIds: p.collectionIds ?? [], attributeValueIds: p.attributeValueIds ?? [],
    material: str(p.material), composition: str(p.composition), careInstructions: str(p.careInstructions),
    fit: p.fit ?? "", season: p.season ?? "", pattern: p.pattern ?? "", occasions: p.occasions, modelInfo: str(p.modelInfo),
    features: p.features.join("\n"),
    price: num(p.basePrice), compareAtPrice: num(p.baseCompareAtPrice), costPrice: num(p.costPrice),
    metaTitle: str(p.metaTitle), metaDescription: str(p.metaDescription), metaKeywords: str(p.metaKeywords),
  };
}

/** Which required fields are missing (labels for the error banner). */
export function missingProductFields(f: ProductFormState): string[] {
  const missing: string[] = [];
  if (!f.name.trim()) missing.push("name");
  if (!f.brandId) missing.push("brand");
  if (!f.categoryId) missing.push("category");
  if (numberOrNull(f.price) === null) missing.push("price");
  return missing;
}

export function formToPayload(f: ProductFormState) {
  return {
    name: f.name.trim(),
    ...(f.slug.trim() ? { slug: f.slug.trim().toLowerCase() } : {}),
    styleCode: textOrNull(f.styleCode),
    status: f.status,
    isFeatured: f.isFeatured,
    shortDescription: textOrNull(f.shortDescription),
    description: textOrNull(f.description),
    brandId: f.brandId,
    categoryId: f.categoryId,
    department: f.department,
    unitId: f.unitId || null,
    supplierId: f.supplierId || null,
    sizeChartId: f.sizeChartId || null,
    tagIds: f.tagIds,
    collectionIds: f.collectionIds,
    attributeValueIds: f.attributeValueIds,
    material: textOrNull(f.material),
    composition: textOrNull(f.composition),
    careInstructions: textOrNull(f.careInstructions),
    fit: f.fit || null,
    season: f.season || null,
    pattern: f.pattern || null,
    occasions: f.occasions,
    modelInfo: textOrNull(f.modelInfo),
    features: linesToList(f.features),
    price: numberOrNull(f.price) ?? 0,
    compareAtPrice: numberOrNull(f.compareAtPrice),
    costPrice: numberOrNull(f.costPrice),
    metaTitle: textOrNull(f.metaTitle),
    metaDescription: textOrNull(f.metaDescription),
    metaKeywords: textOrNull(f.metaKeywords),
  };
}
