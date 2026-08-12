import {
  type PaginatedProducts,
  type Product as AdminProduct,
  type ProductVariant,
  resolveImageUrl,
} from "./admin-api";

const API_BASE_URL =
  typeof window === "undefined"
    ? (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1")
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1");

/**
 * Slug of the tag the catalogue puts on a product that is listed but has not
 * launched yet. Those products are deliberately `active` so they stay
 * browsable and wishlist-able, and carry zero stock on every variant.
 */
const COMING_SOON_TAG = "coming-soon";

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  team: string;
  price: number;
  originalPrice?: number;
  image: string;
  variantId?: string;
  /** Listed but not yet on sale — show a badge, do not let it into the cart. */
  comingSoon: boolean;
};

export type FetchShopProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
};

export type ShopProductsResponse = {
  data: ShopProduct[];
  total: number;
};

export type MappedProduct = {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  collection: string;
  priceNum: number;
  category: string;
  origin: string;
  subtitle: string;
  description: string;
  teas: { name: string; description: string }[];
  ingredients: string[];
  galleryImages: string[];
  variantId: string;
};

export interface TeaItem {
  name: string;
  description: string;
}

export interface ProductInfoProps {
  name: string;
  subtitle: string;
  price: string;
  originalPrice: string;
  vatMessage: string;
  teas: TeaItem[];
  productId: string;
  variantId: string;
  productData: {
    name: string;
    priceNum: number;
    image: string;
    category: string;
  };
}
export type ShopBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
};

export type ShopCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  parentId?: string | null;
  children?: ShopCategory[];
};

/**
 * Admin → Settings → Contact stores phone numbers and e-mail addresses as a
 * JSON column shaped `{ entries: [{ title, value }] }` — the title is the label
 * ("Hotline", "Support") and the value is the number or address itself.
 */
type RawContactEntry = { title?: string | null; value?: string | null } | string;
export type ShopContactJson = { entries?: RawContactEntry[] } | RawContactEntry[] | string | null;

/** A parsed entry — `value` is guaranteed non-empty, `title` may be absent. */
export type ShopContactEntry = { title: string | null; value: string };

/** The six platforms the admin Contact & Social Media screen can populate. */
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
  /** Paragraph under the logo in the footer — Admin → Settings → General. */
  footerDescription?: string | null;
  /** 24-hour "HH:mm" — Admin → Settings → Contact. */
  openingTime?: string | null;
  closingTime?: string | null;
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

/**
 * Flatten a contact column into usable entries.
 *
 * The admin panel seeds its form with a blank `{ title: "", value: "" }` row,
 * so a saved-but-never-filled column arrives as one empty entry — those are
 * dropped here rather than rendered as an empty line in the footer. Older rows
 * saved as a bare array or a plain string are still understood.
 */
export function contactEntries(field: ShopContactJson | undefined): ShopContactEntry[] {
  if (!field) return [];

  const raw: RawContactEntry[] =
    typeof field === "string"
      ? [field]
      : Array.isArray(field)
        ? field
        : Array.isArray(field.entries)
          ? field.entries
          : [];

  const parsed: ShopContactEntry[] = [];
  for (const entry of raw) {
    const value = (typeof entry === "string" ? entry : entry?.value ?? "").trim();
    if (!value) continue;
    const title = typeof entry === "string" ? null : entry?.title?.trim() || null;
    parsed.push({ title, value });
  }
  return parsed;
}

/** Just the values — for places that show a single number or address. */
export function contactValues(field: ShopContactJson | undefined): string[] {
  return contactEntries(field).map((entry) => entry.value);
}

/**
 * What a shopper pays and what it was struck through from.
 *
 * The API applies product discounts per variant and hands back
 * `variant.discountedPrice`; the older top-level `product.discountPrice` is
 * still honoured so nothing regresses if a record predates that. `undefined`
 * for `originalPrice` means there is nothing to strike through.
 */
export function resolveVariantPricing(
  variant: ProductVariant | undefined,
  product?: Pick<AdminProduct, "discountPrice">,
): { price: number; originalPrice?: number } {
  const listPrice = Number(variant?.price ?? 0);

  const offerCandidates = [
    variant?.discountedPrice != null ? Number(variant.discountedPrice) : null,
    product?.discountPrice != null ? Number(product.discountPrice) : null,
  ].filter((value): value is number => value != null && value > 0 && value < listPrice);

  if (offerCandidates.length > 0) {
    return { price: Math.min(...offerCandidates), originalPrice: listPrice };
  }

  // No offer: fall back to showing cost as the "was" price where it is higher.
  const cost = variant?.cost ? Number(variant.cost) : 0;
  return { price: listPrice, originalPrice: cost > listPrice ? cost : undefined };
}

function mapProduct(product: AdminProduct): ShopProduct {
  const defaultVariant = product.variants?.find((v) => v.isDefault) ?? product.variants?.[0];

  const featuredMedia = product.media?.find((m) => m.isFeatured);
  const firstMedia = product.media?.[0];
  const rawImage = featuredMedia?.media.url ?? firstMedia?.media.url ?? "";

  const { price, originalPrice } = resolveVariantPricing(defaultVariant, product);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category?.name ?? "",
    team: product.brand?.name ?? "",
    price,
    originalPrice,
    image: resolveImageUrl(rawImage),
    variantId: defaultVariant?.id,
    comingSoon: product.tags?.some((tag) => tag.slug === COMING_SOON_TAG) ?? false,
  };
}

export async function fetchShopProducts(
  params: FetchShopProductsParams = {},
): Promise<ShopProductsResponse> {
  const { page = 1, limit = 12, search, categoryId, brandId } = params;

  const searchParams = new URLSearchParams();
  searchParams.set("page", String(page));
  searchParams.set("limit", String(limit));
  if (search) {
    searchParams.set("search", search);
  }
  if (categoryId) {
    searchParams.set("categoryId", categoryId);
  }
  if (brandId) {
    searchParams.set("brandId", brandId);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/products?${searchParams.toString()}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.status !== 200) {
      return { data: [], total: 0 };
    }

    const paginated: PaginatedProducts = await res.json();
    return {
      data: (paginated.data ?? []).map(mapProduct),
      total: paginated.meta?.total ?? 0,
    };
  } catch {
    return { data: [], total: 0 };
  }
}

export async function fetchShopProductById(id: string): Promise<AdminProduct | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.status !== 200) return null;

    return await res.json() as AdminProduct;
  } catch {
    return null;
  }
}
async function safeFetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return fallback;
    return await res.json() as T;
  } catch {
    return fallback;
  }
}

export async function fetchShopBrands(): Promise<ShopBrand[]> {
  const brands = await safeFetchJson<ShopBrand[]>(`${API_BASE_URL}/brands`, []);
  return brands.map((brand) => ({
    ...brand,
    logoUrl: brand.logoUrl ? resolveImageUrl(brand.logoUrl) : brand.logoUrl,
  }));
}

function normaliseCategoryImages(category: ShopCategory): ShopCategory {
  return {
    ...category,
    imageUrl: category.imageUrl ? resolveImageUrl(category.imageUrl) : category.imageUrl,
    children: category.children?.map(normaliseCategoryImages),
  };
}

export async function fetchShopCategories(): Promise<ShopCategory[]> {
  const categories = await safeFetchJson<ShopCategory[]>(`${API_BASE_URL}/category`, []);
  return categories.map(normaliseCategoryImages);
}

export async function fetchShopSettings(): Promise<ShopSettings | null> {
  const settings = await safeFetchJson<ShopSettings | null>(`${API_BASE_URL}/settings`, null);
  if (!settings) return null;
  return {
    ...settings,
    logo: settings.logo ? resolveImageUrl(settings.logo) : settings.logo,
    icon: settings.icon ? resolveImageUrl(settings.icon) : settings.icon,
    favicon: settings.favicon ? resolveImageUrl(settings.favicon) : settings.favicon,
  };
}

export function fetchShopTags(): Promise<any[]> {
  return safeFetchJson<any[]>(`${API_BASE_URL}/tags`, []);
}

export function fetchShopAttributes(): Promise<any[]> {
  return safeFetchJson<any[]>(`${API_BASE_URL}/attributes`, []);
}


// ─── Policies ────────────────────────────────────────────────────────────────
// The backend stores one row with a JSON block per policy type. The storefront
// footer wants a flat list, so flatten it here.
export type ShopPolicy = {
  id: string;
  title: string;
  content: string;
};

type PolicyBlock = { title?: string; content?: string } | null | undefined;

type PolicyRecord = {
  delivery?: PolicyBlock;
  return?: PolicyBlock;
  refund?: PolicyBlock;
  cancellation?: PolicyBlock;
  privacy?: PolicyBlock;
  terms?: PolicyBlock;
};

const POLICY_KEYS: (keyof PolicyRecord)[] = [
  "delivery",
  "return",
  "refund",
  "cancellation",
  "privacy",
  "terms",
];

export async function fetchShopPolicies(): Promise<ShopPolicy[]> {
  const record = await safeFetchJson<PolicyRecord | null>(`${API_BASE_URL}/policies`, null);
  if (!record) return [];

  return POLICY_KEYS.flatMap((key) => {
    const block = record[key];
    if (!block?.content) return [];
    return [{ id: key, title: block.title ?? key, content: block.content }];
  });
}

// ─── Campaigns (homepage hero / banners) ─────────────────────────────────────

/**
 * Campaigns are split by the section the admin filed them under: anything in a
 * "…Banner…" section fills the two static slots beside the hero, everything
 * else rides the slider.
 */
export const BANNER_SECTION_TITLE = "Banner Campaign";

export function isBannerSection(sectionTitle?: string | null): boolean {
  return (sectionTitle ?? "").toLowerCase().includes("banner");
}

export type ShopCampaign = {
  id: string;
  title: string;
  description?: string | null;
  images: string[];
  sectionTitle: string | null;
  discountId: string | null;
  /** Where clicking the artwork takes the shopper. */
  href: string;
};

type CampaignRecord = {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  discountId?: string | null;
  hasDiscount?: boolean;
  section?: { id: string; title: string } | null;
  images?: { images?: unknown }[];
};

/**
 * A campaign links to the offer it advertises. With a discount attached the
 * shop opens filtered to that discount's products; without one it opens the
 * campaign's own selection, so the click always lands somewhere relevant.
 */
export function campaignHref(campaign: { id: string; discountId?: string | null }): string {
  return campaign.discountId
    ? `/shop?discount=${encodeURIComponent(campaign.discountId)}`
    : `/shop?campaign=${encodeURIComponent(campaign.id)}`;
}

/** Active campaigns with their banner images flattened into a string array. */
export async function fetchShopCampaigns(): Promise<ShopCampaign[]> {
  const records = await safeFetchJson<CampaignRecord[]>(`${API_BASE_URL}/campaigns`, []);
  const list = Array.isArray(records) ? records : [];

  return list
    .filter((campaign) => (campaign.status ?? "active") === "active")
    .map((campaign) => {
      const discountId = campaign.discountId ?? null;
      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description ?? null,
        sectionTitle: campaign.section?.title ?? null,
        discountId,
        href: campaignHref({ id: campaign.id, discountId }),
        // CampaignImage.images is a JSON column holding an array of URLs.
        images: (campaign.images ?? []).flatMap((entry) =>
          Array.isArray(entry?.images) ? (entry.images as unknown[]).filter((u): u is string => typeof u === "string") : [],
        ).map(resolveImageUrl),
      };
    });
}

/** What the shop needs to narrow itself to one offer: a name and its products. */
export type ShopOffer = { name: string; productIds: string[] };

type DiscountRecord = {
  name?: string;
  products?: { productId?: string; product?: { id?: string } }[];
};

/** The offer behind `/shop?discount=…` — null when the id is unknown. */
export async function fetchDiscountOffer(discountId: string): Promise<ShopOffer | null> {
  const record = await safeFetchJson<DiscountRecord | null>(
    `${API_BASE_URL}/product-discounts/${discountId}`,
    null,
  );
  if (!record?.name) return null;
  return {
    name: record.name,
    productIds: (record.products ?? [])
      .map((entry) => entry.productId ?? entry.product?.id)
      .filter((id): id is string => Boolean(id)),
  };
}

/**
 * The offer behind `/shop?campaign=…`. A campaign with no discount still names
 * itself, so the shopper at least sees which banner brought them here.
 */
export async function fetchCampaignOffer(campaignId: string): Promise<ShopOffer | null> {
  type CampaignDetail = { title?: string; discountId?: string | null };
  const record = await safeFetchJson<CampaignDetail | null>(
    `${API_BASE_URL}/campaigns/${campaignId}`,
    null,
  );
  if (!record?.title) return null;
  const discount = record.discountId ? await fetchDiscountOffer(record.discountId) : null;
  return { name: record.title, productIds: discount?.productIds ?? [] };
}
