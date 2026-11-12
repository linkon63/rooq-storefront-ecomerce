/**
 * Catalog constants shared by the API and the admin/storefront UI.
 * Enum value lists come from the Prisma enums (browser-safe file); labels are
 * the wording shown to people.
 */
import {
  BackInStockStatus,
  CollectionType,
  Department,
  Fit,
  Occasion,
  Pattern,
  ProductStatus,
  Season,
  SizeGroup,
  StockMovementType,
} from "@/lib/generated/prisma/enums";

export const DEPARTMENTS = Object.values(Department);
export const FITS = Object.values(Fit);
export const SEASONS = Object.values(Season);
export const OCCASIONS = Object.values(Occasion);
export const PATTERNS = Object.values(Pattern);
export const SIZE_GROUPS = Object.values(SizeGroup);
export const COLLECTION_TYPES = Object.values(CollectionType);
export const PRODUCT_STATUSES = Object.values(ProductStatus);
export const STOCK_MOVEMENT_TYPES = Object.values(StockMovementType);
export const BACK_IN_STOCK_STATUSES = Object.values(BackInStockStatus);
/** Movement types staff may record by hand from the stock screen. */
export const MANUAL_MOVEMENT_TYPES = ["RESTOCK", "ADJUSTMENT", "CORRECTION"] as const;

export const PRODUCT_SORTS = ["newest", "price_asc", "price_desc", "popular", "rating"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const DEPARTMENT_LABELS: Record<Department, string> = {
  MEN: "Men",
  WOMEN: "Women",
  KIDS: "Kids",
  UNISEX: "Unisex",
};
export const FIT_LABELS: Record<Fit, string> = {
  SLIM: "Slim",
  REGULAR: "Regular",
  RELAXED: "Relaxed",
  OVERSIZED: "Oversized",
};
export const SEASON_LABELS: Record<Season, string> = {
  SPRING_SUMMER: "Spring / Summer",
  AUTUMN_WINTER: "Autumn / Winter",
  ALL_SEASON: "All season",
};
export const OCCASION_LABELS: Record<Occasion, string> = {
  CASUAL: "Casual",
  WORK: "Work",
  FORMAL: "Formal",
  PARTY: "Party",
  SPORT: "Sport",
  LOUNGE: "Lounge",
  WEDDING: "Wedding",
  TRAVEL: "Travel",
};
export const PATTERN_LABELS: Record<Pattern, string> = {
  SOLID: "Solid",
  STRIPED: "Striped",
  CHECKED: "Checked",
  PRINTED: "Printed",
  FLORAL: "Floral",
  GRAPHIC: "Graphic",
  TEXTURED: "Textured",
  COLOR_BLOCK: "Colour block",
};
export const SIZE_GROUP_LABELS: Record<SizeGroup, string> = {
  ALPHA: "Letter sizes",
  NUMERIC: "Numeric sizes",
  SHOE: "Shoe sizes",
  ONE_SIZE: "One size",
};
export const STOCK_MOVEMENT_LABELS: Record<StockMovementType, string> = {
  INITIAL: "Initial stock",
  RESTOCK: "Restock",
  SALE: "Sale",
  RETURN: "Return",
  EXCHANGE: "Exchange",
  CANCELLATION: "Cancellation",
  ADJUSTMENT: "Adjustment",
  CORRECTION: "Correction",
};
export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  draft: "Draft",
};
export const COLLECTION_TYPE_LABELS: Record<CollectionType, string> = {
  COLLECTION: "Collection",
  LOOKBOOK: "Lookbook",
};

/** Order the size groups appear in on cards, filters and the size picker. */
export const SIZE_GROUP_ORDER: Record<SizeGroup, number> = { ALPHA: 0, NUMERIC: 1, SHOE: 2, ONE_SIZE: 3 };

/** Matrix generator default; tokens {style} {color} {size}. */
export const DEFAULT_SKU_PATTERN = "{style}-{color}-{size}";
/** "New arrivals" = published within this many days. */
export const NEW_ARRIVAL_DAYS = 30;
export const RELATED_PRODUCTS_LIMIT = 8;
export const COMPLETE_THE_LOOK_LIMIT = 8;
export const VARIANT_MOVEMENTS_LIMIT = 20;
export const LOW_STOCK_LIST_LIMIT = 20;
export const SEARCH_SUGGESTIONS_LIMIT = 10;
export const DEFAULT_LOW_STOCK_THRESHOLD = 5;
/** Gallery images loaded per product card (primary + hover across colours). */
export const CARD_MEDIA_LIMIT = 24;
/** Interactive transaction budget for multi-row catalog writes (remote DB round trips). */
export const CATALOG_TX_OPTIONS = { maxWait: 10_000, timeout: 60_000 } as const;
