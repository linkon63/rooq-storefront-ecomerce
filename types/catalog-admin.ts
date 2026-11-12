/**
 * Admin view of the catalog API. Derived from the server mappers so the UI
 * and the API cannot drift; `Wire<T>` turns Dates into the ISO strings JSON
 * actually carries. Type-only imports — nothing server-side is bundled.
 */
import type { ProductCardAdmin } from "@/utils/mappers/product-card";
import type { ProductDetail } from "@/utils/mappers/product-detail";
import type { VariantAdmin } from "@/utils/mappers/variant";
import type { ProductFacets } from "@/utils/mappers/product-facets";
import type { ColorResponse, SizeResponse } from "@/utils/mappers/color-size";
import type { SizeChart } from "@/utils/mappers/size-chart";
import type { CollectionSummary, Look } from "@/utils/mappers/collection";
import type { InventoryRow, StockMovementResponse } from "@/utils/mappers/inventory";
import type { BackInStockResponse, BackInStockSummaryRow } from "@/utils/mappers/back-in-stock";
import type { BrandResponse } from "@/utils/mappers/brand";
import type { CategoryResponse } from "@/utils/mappers/category";
import type { ProductCard } from "@/utils/mappers/product-card";
import type { PaginationMeta } from "@/utils/pagination";
import type {
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

export type { CollectionType, Department, Fit, Occasion, Pattern, ProductStatus, Season, SizeGroup, StockMovementType };
export type { ColorRef, SizeRef, Image, NamedRef } from "@/utils/mappers/catalog-refs";

/** JSON shape of a server type (Date → string). */
export type Wire<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? Wire<U>[]
    : T extends object
      ? { [K in keyof T]: Wire<T[K]> }
      : T;

export type Paginated<T> = { data: T[]; meta: PaginationMeta };

export type AdminProductRow = Wire<ProductCardAdmin>;
export type AdminProductList = Paginated<AdminProductRow> & { facets?: Wire<ProductFacets> };
export type AdminProduct = Wire<ProductDetail>;
export type AdminVariant = Wire<VariantAdmin>;
export type AdminProductMedia = AdminProduct["media"][number];
export type ProductCardView = Wire<ProductCard>;

export type AdminColor = Wire<ColorResponse>;
export type AdminSize = Wire<SizeResponse>;
export type AdminSizeChart = Wire<SizeChart>;
export type AdminCollection = Wire<CollectionSummary>;
export type AdminLook = Wire<Look>;
export type AdminCollectionDetail = AdminCollection & {
  metaTitle: string | null;
  metaDescription: string | null;
  productIds: string[];
  products: ProductCardView[];
  looks: AdminLook[];
};
export type AdminInventoryRow = Wire<InventoryRow>;
export type AdminMovement = Wire<StockMovementResponse>;
export type AdminBackInStock = Wire<BackInStockResponse>;
export type AdminBackInStockSummary = BackInStockSummaryRow;
export type AdminBrand = Wire<BrandResponse>;
export type AdminCategory = Wire<CategoryResponse>;
export type LowStockReport = { data: AdminInventoryRow[]; lowStock: number; outOfStock: number };

export type MatrixSkip = { colorId: string; sizeId: string; reason: "exists" | "sku_taken" };
export type MatrixPreview = { planned: { sku: string; colorId: string; sizeId: string }[]; skipped: MatrixSkip[] };
export type MatrixCreated = { created: AdminVariant[]; skipped: MatrixSkip[] };

/** Body of POST/PATCH /products (see lib/server/catalog/products/schemas.ts). */
export type ProductPayload = {
  name: string;
  slug?: string;
  styleCode?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  status?: ProductStatus;
  isFeatured?: boolean;
  brandId: string;
  categoryId: string;
  unitId?: string | null;
  supplierId?: string | null;
  sizeChartId?: string | null;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  department?: Department;
  material?: string | null;
  composition?: string | null;
  careInstructions?: string | null;
  fit?: Fit | null;
  season?: Season | null;
  occasions?: Occasion[];
  pattern?: Pattern | null;
  modelInfo?: string | null;
  features?: string[];
  tagIds?: string[];
  attributeValueIds?: string[];
  collectionIds?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
};

export type VariantBulkItem = {
  id: string;
  price?: number | null;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  stock?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
  barcode?: string | null;
  sku?: string;
};

export type MatrixPayload = {
  colorIds: string[];
  sizeIds: string[];
  skuPattern?: string;
  price?: number | null;
  compareAtPrice?: number | null;
  stock?: number;
  lowStockThreshold?: number;
  dryRun?: boolean;
};

export type SizeChartPayload = {
  name: string;
  slug?: string;
  description?: string | null;
  howToMeasure?: string | null;
  department?: Department | null;
  isActive?: boolean;
  rows: { sizeId: string; measurements: { label: string; valueCm: number }[] }[];
  categoryIds?: string[];
};

export type CollectionPayload = {
  name: string;
  slug?: string;
  type?: CollectionType;
  description?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  position?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  coverImageUrl?: string | null;
  productIds?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export type LookPayload = { title?: string | null; description?: string | null; imageUrl?: string | null; productIds?: string[]; position?: number };

export type ColorPayload = { name: string; hex: string; family?: string | null; sortOrder?: number; isActive?: boolean };
export type SizePayload = { label: string; sizeGroup: SizeGroup; sortOrder?: number; isActive?: boolean };
export type AdjustStockPayload = { variantId: string; change?: number; setTo?: number; type?: "RESTOCK" | "ADJUSTMENT" | "CORRECTION"; reason?: string | null };
