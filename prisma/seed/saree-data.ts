import { SIZE_RUNS } from "./masters";
import type { ProductSeed } from "./product-data";

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

/**
 * Real catalogue: one saree per photo folder in data/product-photos.
 * Names, prices and fabric details are first-draft values: edit them here,
 * then rerun `pnpm db:seed` (every write is an upsert).
 */
export const SAREE_PRODUCTS: ProductSeed[] = [
  {
    ...BASE, slug: "off-white-red-border-saree", name: "Off-White Saree with Red Border", styleCode: "RQ-SR-001",
    photos: "white-saree-red-border", price: 2850, colors: ["white"], material: "Handloom cotton", composition: "100% Cotton",
    occasions: ["CASUAL", "FORMAL"], pattern: "SOLID", featured: true, tags: ["new-arrival", "best-seller"],
    short: "Soft off-white cotton with a woven red border and tasselled pallu.",
    features: ["Woven red border", "Tasselled pallu", "Light, breathable drape"],
  },
  {
    ...BASE, slug: "mustard-block-print-saree", name: "Mustard Block-Print Saree", styleCode: "RQ-SR-002",
    photos: "mustard-saree", price: 3250, colors: ["mustard"], material: "Handloom cotton", composition: "100% Cotton",
    occasions: ["CASUAL", "FORMAL"], pattern: "PRINTED", featured: true, tags: ["new-arrival"],
    short: "Mustard cotton with a hand block-printed border and a contrast pallu.",
    features: ["Hand block-printed border", "Contrast tasselled pallu", "Soft handloom texture"],
  },
  {
    ...BASE, slug: "bright-pink-zari-border-saree", name: "Bright Pink Saree with Zari Border", styleCode: "RQ-SR-003",
    photos: "bright-pink-saree", price: 3450, colors: ["pink"], material: "Soft cotton silk", composition: "Cotton silk blend",
    occasions: ["PARTY", "WEDDING"], pattern: "SOLID", featured: true, tags: ["new-arrival", "best-seller"],
    short: "A vivid pink saree with a fine zari border that catches the light.",
    features: ["Zari border", "Rich, saturated colour", "Fluid drape"],
  },
  {
    ...BASE, slug: "light-pink-floral-saree", name: "Light Pink Floral Print Saree", styleCode: "RQ-SR-004",
    photos: "light-pink-floral-saree", price: 2650, colors: ["light-pink"], material: "Soft cotton", composition: "100% Cotton",
    occasions: ["CASUAL", "PARTY"], pattern: "FLORAL", tags: ["new-arrival"],
    short: "Pale pink cotton with an all-over floral print and a plain border.",
    features: ["All-over floral print", "Lightweight cotton", "Easy everyday drape"],
  },
  {
    ...BASE, slug: "red-ethnic-print-saree", name: "Red Saree with Ethnic Print Border", styleCode: "RQ-SR-005",
    photos: "red-print-saree", price: 3150, colors: ["red"], material: "Handloom cotton", composition: "100% Cotton",
    occasions: ["FORMAL", "WEDDING"], pattern: "PRINTED", tags: ["new-arrival"],
    short: "Deep red cotton with bold ethnic motifs running along the body.",
    features: ["Ethnic motif print", "Handloom cotton", "Festive colour"],
  },
  {
    ...BASE, slug: "lavender-embroidered-border-saree", name: "Lavender Saree with Embroidered Border", styleCode: "RQ-SR-006",
    photos: "lavender-saree", price: 3550, colors: ["lavender"], material: "Light cotton", composition: "100% Cotton",
    occasions: ["PARTY", "FORMAL"], pattern: "SOLID", tags: ["new-arrival"],
    short: "Sheer lavender with an embroidered border and delicate motifs.",
    features: ["Embroidered border", "Sheer, airy fabric", "Soft pastel shade"],
  },
  {
    ...BASE, slug: "teal-block-print-saree", name: "Teal Block-Print Saree", styleCode: "RQ-SR-007",
    photos: "teal-saree", price: 3350, colors: ["teal"], material: "Handloom cotton", composition: "100% Cotton",
    occasions: ["CASUAL", "FORMAL"], pattern: "PRINTED", tags: ["new-arrival"],
    short: "Teal cotton scattered with block-printed motifs and a floral border.",
    features: ["Block-printed motifs", "Floral border", "Breathable handloom cotton"],
  },
  {
    ...BASE, slug: "magenta-zari-flower-saree", name: "Magenta Saree with Zari Flowers", styleCode: "RQ-SR-008",
    photos: "magenta-zari-saree", price: 4250, colors: ["magenta"], material: "Fine cotton silk", composition: "Cotton silk blend",
    occasions: ["PARTY", "WEDDING"], pattern: "FLORAL", featured: true, tags: ["new-arrival"],
    short: "Magenta with golden zari flowers and a zari-woven border and tassels.",
    features: ["Zari flower motifs", "Woven zari border", "Tasselled pallu"],
  },
];
