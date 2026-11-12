/**
 * Storefront view of the catalog API (docs/architecture/fashion-api-contract.md).
 * Client-safe: plain string unions, no Prisma imports.
 */

export type Department = "MEN" | "WOMEN" | "KIDS" | "UNISEX";
export type Fit = "SLIM" | "REGULAR" | "RELAXED" | "OVERSIZED";
export type Season = "SPRING_SUMMER" | "AUTUMN_WINTER" | "ALL_SEASON";
export type Occasion = "CASUAL" | "WORK" | "FORMAL" | "PARTY" | "SPORT" | "LOUNGE" | "WEDDING" | "TRAVEL";
export type Pattern =
  | "SOLID"
  | "STRIPED"
  | "CHECKED"
  | "PRINTED"
  | "FLORAL"
  | "GRAPHIC"
  | "TEXTURED"
  | "COLOR_BLOCK";
export type SizeGroup = "ALPHA" | "NUMERIC" | "SHOE" | "ONE_SIZE";
export type CollectionType = "COLLECTION" | "LOOKBOOK";
export type ProductSort = "newest" | "price_asc" | "price_desc" | "popular" | "rating";

export type Image = { id: string; url: string; alt: string | null; width: number | null; height: number | null };
export type PositionedImage = Image & { position: number };
export type ColorRef = { id: string; slug: string; name: string; hex: string };
export type SizeRef = { id: string; slug: string; label: string; sizeGroup: SizeGroup; sortOrder: number };
export type NamedRef = { id: string; slug: string; name: string };

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  brand: NamedRef;
  category: NamedRef;
  department: Department;
  price: number;
  compareAtPrice: number | null;
  isOnSale: boolean;
  discountPercent: number;
  image: Image | null;
  hoverImage: Image | null;
  colors: (ColorRef & { image: Image | null })[];
  sizes: (SizeRef & { inStock: boolean })[];
  defaultVariantId: string | null;
  inStock: boolean;
  lowStockCount: number | null;
  ratingAvg: number;
  ratingCount: number;
  tags: string[];
  isNew: boolean;
  isFeatured: boolean;
};

export type CountedValue<T extends string = string> = { value: T; count: number };
export type CountedRef = NamedRef & { count: number };

export type ProductFacets = {
  departments: CountedValue<Department>[];
  categories: CountedRef[];
  sizes: (SizeRef & { count: number })[];
  colors: (ColorRef & { family: string | null; count: number })[];
  brands: CountedRef[];
  fits: CountedValue<Fit>[];
  materials: CountedValue[];
  price: { min: number; max: number };
};

export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number };
export type Paginated<T> = { data: T[]; meta: PaginationMeta };
export type ProductList = Paginated<ProductCard> & { facets?: ProductFacets };

export type VariantPublic = {
  id: string;
  sku: string;
  colorId: string;
  sizeId: string;
  price: number;
  compareAtPrice: number | null;
  inStock: boolean;
  lowStockCount: number | null;
  isDefault: boolean;
};

export type SizeChart = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  howToMeasure: string | null;
  department: Department | null;
  isActive: boolean;
  columns: string[];
  rows: { sizeId: string; sizeLabel: string; position: number; values: Record<string, number> }[];
};

export type FitFeedback = "RUNS_SMALL" | "TRUE_TO_SIZE" | "RUNS_LARGE";
export type FitSummary = {
  RUNS_SMALL: number;
  TRUE_TO_SIZE: number;
  RUNS_LARGE: number;
  total: number;
  verdict: FitFeedback | null;
};

export type DeliveryInfo = {
  chargeInside: number;
  chargeNearCity: number;
  chargeOutside: number;
  freeShippingThreshold: number | null;
  returnWindowDays: number;
};

export type ProductColor = ColorRef & { images: PositionedImage[] };

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  styleCode: string | null;
  shortDescription: string | null;
  description: string | null;
  status: string;
  brand: NamedRef & { logoUrl: string | null };
  category: NamedRef;
  breadcrumbs: { slug: string; name: string }[];
  department: Department;
  material: string | null;
  composition: string | null;
  careInstructions: string | null;
  fit: Fit | null;
  season: Season | null;
  occasions: Occasion[];
  pattern: Pattern | null;
  modelInfo: string | null;
  features: string[];
  price: number;
  compareAtPrice: number | null;
  isOnSale: boolean;
  discountPercent: number;
  colors: ProductColor[];
  sharedImages: PositionedImage[];
  sizes: SizeRef[];
  variants: VariantPublic[];
  defaultVariantId: string | null;
  sizeChart: SizeChart | null;
  attributes: { attribute: string; value: string }[];
  tags: { slug: string; name: string }[];
  collections: { slug: string; name: string; type: CollectionType }[];
  rating: { average: number; count: number; fit: FitSummary };
  delivery: DeliveryInfo;
  related: ProductCard[];
  completeTheLook: ProductCard[];
  seo: { metaTitle: string | null; metaDescription: string | null; metaKeywords: string | null };
};

export type CollectionSummary = {
  id: string;
  slug: string;
  name: string;
  type: CollectionType;
  description: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
  position: number;
  startsAt: string | null;
  endsAt: string | null;
  productCount: number;
};

export type Look = {
  id: string;
  title: string | null;
  description: string | null;
  position: number;
  imageUrl: string | null;
  products: ProductCard[];
};

export type CollectionDetail = CollectionSummary & {
  products: ProductCard[];
  looks: Look[];
  metaTitle: string | null;
  metaDescription: string | null;
  meta?: PaginationMeta;
};

export type ShopCategoryNode = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  children?: ShopCategoryNode[];
};

export type ShopBrandRef = { id: string; name: string; slug: string; logoUrl?: string | null };
