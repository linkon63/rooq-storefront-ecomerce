import { SIZE_RUNS } from "./masters";
import { ERROR_MESSAGES } from "../../lib/constants/error-messages";
import type { ProductSeed } from "./product-data";
import { readCatalogue } from "./readme-catalogue";

const SAREE_CARE = "Dry clean first. Then hand wash cold with mild soap, dry in shade, press on low heat.";

/** Fields every saree shares; each entry below only adds what differs. */
const BASE = {
  category: "women-sarees",
  brand: "rooq",
  department: "WOMEN",
  sizes: SIZE_RUNS.oneSize,
  care: SAREE_CARE,
  season: "ALL_SEASON",
  stock: 12,
} as const;

type SareeMeta = Pick<ProductSeed, "slug" | "styleCode" | "colors" | "material" | "composition" | "occasions" | "pattern" | "featured" | "tags">;

/**
 * Shop settings the README does not hold, keyed by photo folder. A new product
 * needs an entry here; its text and price come from the README.
 */
const META: Record<string, SareeMeta> = {
  "shubhrota": {
    slug: "off-white-red-border-saree", styleCode: "RQ-SR-001", colors: ["white"],
    material: "Aarong cotton", composition: "Cotton",
    occasions: ["CASUAL", "FORMAL"], pattern: "SOLID", featured: true, tags: ["new-arrival", "best-seller"],
  },
  "hoimonti": {
    slug: "mustard-block-print-saree", styleCode: "RQ-SR-002", colors: ["mustard"],
    material: "Aarong cotton", composition: "Cotton",
    occasions: ["CASUAL", "FORMAL"], pattern: "PRINTED", featured: true, tags: ["new-arrival"],
  },
  "roktojoba": {
    slug: "bright-pink-zari-border-saree", styleCode: "RQ-SR-003", colors: ["pink"],
    material: "Aarong cotton", composition: "Cotton",
    occasions: ["PARTY", "WEDDING"], pattern: "SOLID", featured: true, tags: ["new-arrival", "best-seller"],
  },
  "hawai-mithai": {
    slug: "light-pink-floral-saree", styleCode: "RQ-SR-004", colors: ["light-pink"],
    material: "Aarong cotton", composition: "Cotton",
    occasions: ["CASUAL", "PARTY"], pattern: "FLORAL", tags: ["new-arrival"],
  },
  "meruni": {
    slug: "red-ethnic-print-saree", styleCode: "RQ-SR-005", colors: ["red"],
    material: "Soft handloom cotton", composition: "Cotton",
    occasions: ["FORMAL", "WEDDING"], pattern: "PRINTED", tags: ["new-arrival"],
  },
  "lavender-student-saree": {
    slug: "lavender-embroidered-border-saree", styleCode: "RQ-SR-006", colors: ["lavender"],
    material: "Light cotton", composition: "100% Cotton",
    occasions: ["PARTY", "FORMAL"], pattern: "SOLID", tags: ["new-arrival"],
  },
  "teal-student-saree": {
    slug: "teal-block-print-saree", styleCode: "RQ-SR-007", colors: ["teal"],
    material: "Handloom cotton", composition: "100% Cotton",
    occasions: ["CASUAL", "FORMAL"], pattern: "PRINTED", tags: ["new-arrival"],
  },
  "ranga-padma": {
    slug: "magenta-zari-flower-saree", styleCode: "RQ-SR-008", colors: ["magenta"],
    material: "Kota", composition: "Cotton",
    occasions: ["PARTY", "WEDDING"], pattern: "FLORAL", featured: true, tags: ["new-arrival"],
  },
};

/**
 * Real catalogue: names, prices, descriptions and features come from
 * data/product-photos/README.md. Edit it, then rerun `pnpm db:seed`.
 */
export const SAREE_PRODUCTS: ProductSeed[] = readCatalogue().map(({ folder, fabric, ...product }) => {
  const meta = META[folder];
  if (!meta) throw new Error(ERROR_MESSAGES.seed.missingMeta(folder));
  return { ...BASE, ...meta, ...product, material: fabric ?? meta.material, photos: folder };
});
