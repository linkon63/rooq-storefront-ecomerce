import { DEPARTMENT_LABELS, PRODUCT_SORTS } from "@/lib/constants/catalog";
import type { Department, Fit, ProductSort } from "@/types/storefront/catalog";
import type { QueryParams } from "@/utils/query-string";

/**
 * Shop filters <-> URL. Every filter lives in the query string so a filtered
 * view can be shared, bookmarked and navigated back to
 * (`/shop?department=WOMEN&size=alpha-m&color=black,sage&sort=price_asc`).
 */

export type ShopFilters = {
  search: string;
  category: string[];
  department: Department[];
  size: string[];
  color: string[];
  brand: string[];
  material: string[];
  fit: Fit[];
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  onSale: boolean;
  isNew: boolean;
  collection: string | null;
  sort: ProductSort;
  page: number;
};

export type ListFilterKey = "category" | "department" | "size" | "color" | "brand" | "material" | "fit";
export type ToggleFilterKey = "inStock" | "onSale";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const DEPARTMENT_VALUES: readonly Department[] = ["MEN", "WOMEN", "KIDS", "UNISEX"];
const FIT_VALUES: readonly Fit[] = ["SLIM", "REGULAR", "RELAXED", "OVERSIZED"];
export const DEFAULT_SORT: ProductSort = "newest";

function list(raw: string | string[] | undefined): string[] {
  const parts = (Array.isArray(raw) ? raw : raw ? [raw] : []).flatMap((value) => value.split(","));
  return [...new Set(parts.map((value) => value.trim()).filter(Boolean))];
}

function enumList<T extends string>(raw: string | string[] | undefined, allowed: readonly T[]): T[] {
  return list(raw)
    .map((value) => value.toUpperCase())
    .filter((value): value is T => (allowed as readonly string[]).includes(value));
}

function single(raw: string | string[] | undefined): string {
  return (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
}

function amount(raw: string | string[] | undefined): number | null {
  const value = Number(single(raw));
  return single(raw) !== "" && Number.isFinite(value) && value >= 0 ? value : null;
}

function flag(raw: string | string[] | undefined): boolean {
  return single(raw) === "true" || single(raw) === "1";
}

export function parseShopFilters(params: RawSearchParams, preset: Partial<ShopFilters> = {}): ShopFilters {
  const sort = single(params.sort);
  const page = Number(single(params.page));
  return {
    search: single(params.q) || single(params.search),
    category: list(params.category),
    department: enumList(params.department, DEPARTMENT_VALUES),
    size: list(params.size),
    color: list(params.color),
    brand: list(params.brand),
    material: list(params.material),
    fit: enumList(params.fit, FIT_VALUES),
    minPrice: amount(params.minPrice),
    maxPrice: amount(params.maxPrice),
    inStock: flag(params.inStock),
    onSale: flag(params.onSale),
    isNew: flag(params.new),
    collection: single(params.collection) || null,
    sort: (PRODUCT_SORTS as readonly string[]).includes(sort) ? (sort as ProductSort) : DEFAULT_SORT,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    ...preset,
  };
}

/** Filters → `GET /products` query. */
export function toProductQuery(filters: ShopFilters, limit: number): QueryParams {
  return {
    search: filters.search,
    category: filters.category,
    department: filters.department,
    size: filters.size,
    color: filters.color,
    brand: filters.brand,
    material: filters.material,
    fit: filters.fit,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    inStock: filters.inStock || undefined,
    onSale: filters.onSale || undefined,
    new: filters.isNew || undefined,
    collection: filters.collection,
    sort: filters.sort,
    page: filters.page,
    limit,
    facets: true,
  };
}

/** Filters → the shop page's own URL query (defaults omitted to keep URLs short). */
export function toShopQuery(filters: ShopFilters, preset: Partial<ShopFilters> = {}): QueryParams {
  const keep = <K extends keyof ShopFilters>(key: K) => (key in preset ? undefined : filters[key]);
  return {
    q: filters.search,
    category: keep("category") as string[] | undefined,
    department: keep("department") as string[] | undefined,
    size: filters.size,
    color: filters.color,
    brand: filters.brand,
    material: filters.material,
    fit: filters.fit,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    inStock: filters.inStock || undefined,
    onSale: keep("onSale") ? true : undefined,
    new: keep("isNew") ? true : undefined,
    sort: filters.sort === DEFAULT_SORT ? undefined : filters.sort,
    page: filters.page > 1 ? filters.page : undefined,
  };
}

export function toggleListValue<T extends string>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

/** How many refinements are on (for the "Filter (3)" button). */
export function activeFilterCount(filters: ShopFilters, preset: Partial<ShopFilters> = {}): number {
  const lists: ListFilterKey[] = ["category", "department", "size", "color", "brand", "material", "fit"];
  const listCount = lists.filter((key) => !(key in preset)).reduce((sum, key) => sum + filters[key].length, 0);
  const price = filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0;
  const toggles = (filters.inStock ? 1 : 0) + (filters.onSale && !("onSale" in preset) ? 1 : 0);
  return listCount + price + toggles;
}

/** The same filters with every refinement cleared but search, sort and presets kept. */
export function clearedFilters(filters: ShopFilters, preset: Partial<ShopFilters> = {}): ShopFilters {
  return {
    ...filters,
    category: [],
    department: [],
    size: [],
    color: [],
    brand: [],
    material: [],
    fit: [],
    minPrice: null,
    maxPrice: null,
    inStock: false,
    onSale: false,
    page: 1,
    ...preset,
  };
}

/** Page title for /shop: the department name when exactly one is chosen. */
export function shopTitle(params: RawSearchParams): string {
  const { department } = parseShopFilters(params);
  return department.length === 1 ? DEPARTMENT_LABELS[department[0]] : "Shop all";
}
