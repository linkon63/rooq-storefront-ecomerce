import "server-only";
import { cache } from "react";
import { RAIL_PAGE_SIZE } from "@/lib/constants/storefront";
import { listBrands } from "@/lib/server/catalog/brands/service";
import { listCategoryTree } from "@/lib/server/catalog/categories/service";
import { collectionDetailQuery, collectionListQuery } from "@/lib/server/catalog/collections/schemas";
import { getCollectionBySlug as findCollectionBySlug, listCollections as findCollections } from "@/lib/server/catalog/collections/service";
import { getProductById as findProductById, getProductDetail } from "@/lib/server/catalog/products/detail";
import { listProducts } from "@/lib/server/catalog/products/list";
import { productListQuery } from "@/lib/server/catalog/products/list-schema";
import { getPolicies } from "@/lib/server/policies/service";
import { getSettings } from "@/lib/server/settings/service";
import { parseValue, searchParamsToObject } from "@/lib/server/validation";
import type {
  CollectionDetail,
  CollectionSummary,
  CollectionType,
  ProductDetail,
  ProductList,
  ShopBrandRef,
  ShopCategoryNode,
} from "@/types/storefront/catalog";
import type { StorePolicy, StoreSettings } from "@/types/storefront/content";
import { toQueryString, type QueryParams } from "@/utils/query-string";
import { EMPTY_SETTINGS, normalisePolicies, normaliseSettings } from "@/utils/storefront/settings";
import { cachedRead, readOr, readOrNull } from "./server-api";

/**
 * Server-side loaders for storefront pages: in-process service calls (see
 * server-api.ts), cached across requests and wrapped in React.cache so
 * generateMetadata and the page share one read.
 */

const EMPTY_LIST: ProductList = { data: [], meta: { page: 1, limit: 0, total: 0, totalPages: 0 } };

/** Query string → the same object the GET route builds from its URL. */
const queryObject = (qs: string) => searchParamsToObject(new URLSearchParams(qs));

const readSettings = cachedRead<[], unknown>("settings", () => getSettings());
const readPolicies = cachedRead<[], unknown>("policies", () => getPolicies());
const readCategories = cachedRead<[], ShopCategoryNode[]>("categories", () => listCategoryTree());
const readBrands = cachedRead<[], ShopBrandRef[]>("brands", () => listBrands());
const readProducts = cachedRead<[string], ProductList>("products", (qs) =>
  listProducts(parseValue(queryObject(qs), productListQuery), { isStaff: false }),
);
const readProductBySlug = cachedRead<[string], ProductDetail>("product-slug", (slug) => getProductDetail(slug));
const readProductById = cachedRead<[string], ProductDetail>("product-id", (id) => findProductById(id, { admin: false }));
const readCollections = cachedRead<[string], CollectionSummary[]>("collections", (qs) =>
  findCollections(parseValue(queryObject(qs), collectionListQuery), false),
);
const readCollection = cachedRead<[string, number], CollectionDetail>("collection", (slug, page) =>
  findCollectionBySlug(slug, parseValue({ page: String(page), limit: "24" }, collectionDetailQuery)),
);

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  const raw = await readOr("settings", readSettings, null);
  return raw ? normaliseSettings(raw) : EMPTY_SETTINGS;
});

export const getStorePolicies = cache(async (): Promise<StorePolicy[]> => normalisePolicies(await readOr("policies", readPolicies, null)));

export const getCategoryTree = cache((): Promise<ShopCategoryNode[]> => readOr("categories", readCategories, []));

export const getBrands = cache((): Promise<ShopBrandRef[]> => readOr("brands", readBrands, []));

/** The shop listing. Throws so the page can show its error state. */
export function listProductsServer(query: QueryParams): Promise<ProductList> {
  return readProducts(toQueryString(query));
}

/** A home/collection rail: never throws, answers an empty list instead. */
export function productRail(query: QueryParams): Promise<ProductList> {
  return readOr("product rail", () => readProducts(toQueryString({ limit: RAIL_PAGE_SIZE, facets: false, ...query })), EMPTY_LIST);
}

export const getProductBySlug = cache((slug: string): Promise<ProductDetail | null> => readOrNull(() => readProductBySlug(slug)));

export const getProductById = cache((id: string): Promise<ProductDetail | null> => readOrNull(() => readProductById(id)));

export function listCollections(query: { type?: CollectionType; featured?: boolean } = {}): Promise<CollectionSummary[]> {
  return readOr("collections", () => readCollections(toQueryString({ type: query.type, featured: query.featured || undefined })), []);
}

export const getCollectionBySlug = cache(
  (slug: string, page: number): Promise<CollectionDetail | null> => readOrNull(() => readCollection(slug, page)),
);
