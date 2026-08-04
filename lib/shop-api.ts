import { type PaginatedProducts, type Product as AdminProduct, resolveImageUrl } from "./admin-api";

const API_BASE_URL =
  typeof window === "undefined"
    ? (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1")
    : (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1");

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  team: string;
  price: number;
  originalPrice?: number;
  image: string;
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

export type ShopSettings = {
  id: string;
  shopName: string;
  slogan: string;
  logo?: string | null;
  icon?: string | null;
  favicon?: string | null;
  branchName?: string | null;
  branchAddress?: string | null;
  contactNumber?: any;
  email?: any;
  socialContact?: any;
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

function mapProduct(product: AdminProduct): ShopProduct {
  const defaultVariant = product.variants?.find((v) => v.isDefault) ?? product.variants?.[0];

  const featuredMedia = product.media?.find((m) => m.isFeatured);
  const firstMedia = product.media?.[0];
  const rawImage = featuredMedia?.media.url ?? firstMedia?.media.url ?? "";

  const priceNum = Number(defaultVariant?.price ?? 0);
  const costNum = defaultVariant?.cost ? Number(defaultVariant.cost) : 0;
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : 0;
  const showOriginal = discountPrice > 0 && discountPrice < priceNum;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category?.name ?? "",
    team: product.brand?.name ?? "",
    price: showOriginal ? discountPrice : priceNum,
    originalPrice: showOriginal ? priceNum : (costNum > priceNum ? costNum : undefined),
    image: resolveImageUrl(rawImage),
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
export type ShopCampaign = {
  id: string;
  title: string;
  description?: string | null;
  images: string[];
};

type CampaignRecord = {
  id: string;
  title: string;
  description?: string | null;
  status?: string;
  images?: { images?: unknown }[];
};

/** Active campaigns with their banner images flattened into a string array. */
export async function fetchShopCampaigns(): Promise<ShopCampaign[]> {
  const records = await safeFetchJson<CampaignRecord[]>(`${API_BASE_URL}/campaigns`, []);
  const list = Array.isArray(records) ? records : [];

  return list
    .filter((campaign) => (campaign.status ?? "active") === "active")
    .map((campaign) => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description ?? null,
      // CampaignImage.images is a JSON column holding an array of URLs.
      images: (campaign.images ?? []).flatMap((entry) =>
        Array.isArray(entry?.images) ? (entry.images as unknown[]).filter((u): u is string => typeof u === "string") : [],
      ).map(resolveImageUrl),
    }));
}
