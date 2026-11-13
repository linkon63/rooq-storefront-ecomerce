import { apiRequest } from "@/lib/api";
import { compressFormImages } from "@/lib/compress-image";
import { SEARCH_RESULTS_LIMIT } from "@/lib/constants/storefront";
import type { ProductDetail, ProductList } from "@/types/storefront/catalog";
import type { Review, ReviewSort, ReviewSummary } from "@/types/storefront/commerce";
import type { Paginated } from "@/types/storefront/catalog";
import { contactEntries as parseContactEntries } from "@/utils/storefront/settings";
import type { QueryParams } from "@/utils/query-string";

/**
 * Browser-side catalog client (products, reviews, back-in-stock). Server
 * components read through `lib/storefront/catalog-data.ts` instead.
 */

export function listProducts(query: QueryParams, signal?: AbortSignal): Promise<ProductList> {
  return apiRequest<ProductList>("/products", { query, signal });
}

export function getProduct(id: string, signal?: AbortSignal): Promise<ProductDetail> {
  return apiRequest<ProductDetail>(`/products/${encodeURIComponent(id)}`, { signal });
}

export function searchProducts(term: string, signal?: AbortSignal): Promise<ProductList> {
  return listProducts({ search: term, limit: SEARCH_RESULTS_LIMIT, facets: false }, signal);
}

export function requestBackInStock(variantId: string, email: string): Promise<{ id: string; status: string }> {
  return apiRequest("/back-in-stock", { method: "POST", body: { variantId, email } });
}

export type ReviewPage = Paginated<Review> & { summary: ReviewSummary };

export function listReviews(
  productId: string,
  query: { page: number; limit: number; sort: ReviewSort; withPhotos?: boolean },
): Promise<ReviewPage> {
  return apiRequest<ReviewPage>(`/products/${encodeURIComponent(productId)}/reviews`, {
    query: { ...query, withPhotos: query.withPhotos || undefined },
  });
}

/** Multipart: rating, title?, comment?, fitFeedback?, variantId?, photos[]. */
/** Photos are shrunk in the browser first, so five phone photos still fit the host's body limit. */
export async function postReview(productId: string, form: FormData): Promise<Review> {
  const body = await compressFormImages(form);
  return apiRequest<Review>(`/products/${encodeURIComponent(productId)}/reviews`, { method: "POST", body });
}

// ─── Legacy settings shape (admin invoice + order panel still read it) ────────

export type ShopContactEntry = { title: string | null; value: string };
type RawContactEntry = { title?: string | null; value?: string | null } | string;
export type ShopContactJson = { entries?: RawContactEntry[] } | RawContactEntry[] | string | null;

export type ShopSocialContact = {
  facebook?: string | null;
  instagram?: string | null;
  youtube?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
};

export type ShopSettings = {
  id: string;
  shopName: string;
  slogan: string;
  footerDescription?: string | null;
  openingTime?: string | null;
  closingTime?: string | null;
  showCertifications?: boolean;
  logo?: string | null;
  icon?: string | null;
  favicon?: string | null;
  branchName?: string | null;
  branchAddress?: string | null;
  contactNumber?: ShopContactJson;
  email?: ShopContactJson;
  socialContact?: ShopSocialContact | null;
  currency: string;
  language: string;
  deliveryChargeInside: string;
  deliveryChargeOutside: string;
  deliveryChargeNearCity: string;
  youtubeUrl?: string | null;
  youtubeThumbnailImage?: string | null;
  youtubeTitle?: string | null;
  youtubeDescription?: string | null;
};

export function contactEntries(field: ShopContactJson | undefined): ShopContactEntry[] {
  return parseContactEntries(field ?? null);
}

export function contactValues(field: ShopContactJson | undefined): string[] {
  return contactEntries(field).map((entry) => entry.value);
}

/** GET /settings in its raw shape, or null when it cannot be read. */
export async function fetchShopSettings(): Promise<ShopSettings | null> {
  try {
    return await apiRequest<ShopSettings>("/settings");
  } catch {
    return null;
  }
}
