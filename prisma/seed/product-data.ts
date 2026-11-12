import type { Department, Fit, Occasion, Pattern, Season } from "../../lib/generated/prisma/enums";
import type { ColorSlug } from "./masters";
import { SIZE_RUNS } from "./masters";
import type { GarmentKind } from "./placeholder-art";

export type ProductSeed = {
  slug: string;
  name: string;
  styleCode: string;
  category: string;
  brand: string;
  department: Department;
  kind: GarmentKind;
  price: number;
  compareAtPrice?: number;
  colors: ColorSlug[];
  sizes: readonly string[];
  material: string;
  composition: string;
  care: string;
  fit?: Fit;
  season: Season;
  occasions: Occasion[];
  pattern: Pattern;
  modelInfo?: string;
  short: string;
  features: string[];
  tags?: string[];
  attributes?: string[];
  unit?: "pair";
  featured?: boolean;
};

const COTTON_CARE = "Machine wash cold, inside out. Do not tumble dry. Warm iron.";
const DENIM_CARE = "Wash rarely, cold and inside out. Line dry to keep the colour deep.";

export const PRODUCTS: ProductSeed[] = [
  {
    slug: "essential-crew-tee", name: "Essential Crew Tee", styleCode: "RQ-TS-001", category: "men-t-shirts", brand: "rooq",
    department: "MEN", kind: "tee", price: 1290, colors: ["black", "white", "navy", "olive"], sizes: SIZE_RUNS.alphaMen,
    material: "Combed cotton jersey", composition: "100% Cotton", care: COTTON_CARE, fit: "REGULAR", season: "ALL_SEASON",
    occasions: ["CASUAL"], pattern: "SOLID", modelInfo: "Model is 183 cm and wears M",
    short: "The everyday tee, cut from 180 gsm combed cotton.", features: ["180 gsm combed cotton", "Rib crew neck", "Pre-shrunk"],
    tags: ["best-seller"], attributes: ["neckline:Crew", "sleeve:Short"], featured: true,
  },
  {
    slug: "oversized-heavyweight-tee", name: "Oversized Heavyweight Tee", styleCode: "RQ-TS-002", category: "men-t-shirts", brand: "rooq-studio",
    department: "UNISEX", kind: "tee", price: 1590, compareAtPrice: 1890, colors: ["ecru", "charcoal", "sage"], sizes: SIZE_RUNS.alpha,
    material: "Heavyweight cotton", composition: "100% Organic cotton", care: COTTON_CARE, fit: "OVERSIZED", season: "SPRING_SUMMER",
    occasions: ["CASUAL", "LOUNGE"], pattern: "SOLID", modelInfo: "Model is 178 cm and wears L for an oversized look",
    short: "Boxy, dropped-shoulder tee in 240 gsm organic cotton.", features: ["240 gsm organic cotton", "Dropped shoulders", "Boxy fit"],
    tags: ["new-arrival", "sustainable"], attributes: ["neckline:Crew", "sleeve:Short"],
  },
  {
    slug: "oxford-button-down-shirt", name: "Oxford Button-Down Shirt", styleCode: "RQ-SH-001", category: "men-shirts", brand: "rooq",
    department: "MEN", kind: "shirt", price: 2490, colors: ["sky-blue", "white", "navy"], sizes: SIZE_RUNS.alphaMen,
    material: "Oxford cotton", composition: "100% Cotton", care: COTTON_CARE, fit: "SLIM", season: "ALL_SEASON",
    occasions: ["WORK", "CASUAL"], pattern: "SOLID", modelInfo: "Model is 185 cm and wears M",
    short: "A sharp, soft-washed oxford with a button-down collar.", features: ["Button-down collar", "Back box pleat", "Mother-of-pearl buttons"],
    tags: ["best-seller"], attributes: ["neckline:Collared", "sleeve:Long"], featured: true,
  },
  {
    slug: "linen-camp-collar-shirt", name: "Linen Camp-Collar Shirt", styleCode: "RQ-SH-002", category: "men-shirts", brand: "rooq-studio",
    department: "MEN", kind: "shirt", price: 2790, compareAtPrice: 3290, colors: ["sand", "olive", "ecru"], sizes: SIZE_RUNS.alphaMen,
    material: "European linen", composition: "100% Linen", care: "Hand wash or gentle cycle cold. Line dry. Steam to relax creases.",
    fit: "RELAXED", season: "SPRING_SUMMER", occasions: ["CASUAL", "TRAVEL"], pattern: "SOLID", modelInfo: "Model is 180 cm and wears M",
    short: "Breezy linen with a relaxed camp collar for warm days.", features: ["Garment-washed linen", "Camp collar", "Straight hem"],
    tags: ["new-arrival"], attributes: ["neckline:Collared", "sleeve:Short"],
  },
  {
    slug: "slim-selvedge-jeans", name: "Slim Selvedge Jeans", styleCode: "RQ-JN-001", category: "men-jeans", brand: "northline",
    department: "MEN", kind: "trousers", price: 3990, colors: ["indigo", "black"], sizes: SIZE_RUNS.waistMen,
    material: "Selvedge denim, 13.5 oz", composition: "99% Cotton, 1% Elastane", care: DENIM_CARE, fit: "SLIM", season: "ALL_SEASON",
    occasions: ["CASUAL", "WORK"], pattern: "SOLID", modelInfo: "Model is 183 cm and wears 32",
    short: "Rigid-look selvedge denim with just enough stretch.", features: ["13.5 oz selvedge", "Five pockets", "Tapered leg"],
    tags: ["best-seller"],
  },
  {
    slug: "relaxed-pleated-trousers", name: "Relaxed Pleated Trousers", styleCode: "RQ-TR-001", category: "men-trousers", brand: "rooq",
    department: "MEN", kind: "trousers", price: 3490, colors: ["charcoal", "camel"], sizes: SIZE_RUNS.waistMen,
    material: "Brushed twill", composition: "68% Polyester, 30% Viscose, 2% Elastane", care: "Machine wash 30°C. Hang to dry.",
    fit: "RELAXED", season: "AUTUMN_WINTER", occasions: ["WORK", "FORMAL"], pattern: "SOLID", modelInfo: "Model is 185 cm and wears 32",
    short: "Single-pleat trousers with a relaxed, tapered leg.", features: ["Single front pleat", "Side adjusters", "Pressed crease"],
  },
  {
    slug: "quilted-field-jacket", name: "Quilted Field Jacket", styleCode: "RQ-OW-001", category: "men-outerwear", brand: "northline",
    department: "MEN", kind: "outerwear", price: 6990, compareAtPrice: 8490, colors: ["olive", "navy"], sizes: ["alpha-s", "alpha-m", "alpha-l", "alpha-xl"],
    material: "Recycled nylon shell", composition: "Shell: 100% Recycled nylon. Fill: 100% Polyester", care: "Machine wash 30°C, gentle. Do not iron.",
    fit: "REGULAR", season: "AUTUMN_WINTER", occasions: ["CASUAL", "TRAVEL"], pattern: "TEXTURED", modelInfo: "Model is 183 cm and wears M",
    short: "Lightweight diamond-quilted layer with corduroy collar.", features: ["Diamond quilting", "Corduroy collar", "Snap front"],
    tags: ["sustainable"], featured: true,
  },
  {
    slug: "leather-court-sneaker", name: "Leather Court Sneaker", styleCode: "RQ-FW-001", category: "men-footwear", brand: "rooq",
    department: "UNISEX", kind: "shoe", price: 5490, colors: ["white", "black"], sizes: SIZE_RUNS.shoeUnisex,
    material: "Full-grain leather", composition: "Upper: Leather. Sole: Rubber", care: "Wipe clean with a damp cloth. Use leather balm monthly.",
    season: "ALL_SEASON", occasions: ["CASUAL"], pattern: "SOLID", short: "Clean, minimal court sneaker on a cupsole.",
    features: ["Full-grain leather", "Stitched cupsole", "Cushioned insole"], tags: ["best-seller"], unit: "pair", featured: true,
  },
  {
    slug: "ribbed-knit-top", name: "Ribbed Knit Top", styleCode: "RQ-WT-001", category: "women-tops", brand: "rooq-studio",
    department: "WOMEN", kind: "tee", price: 1490, colors: ["black", "blush", "ecru"], sizes: SIZE_RUNS.alphaCore,
    material: "Rib knit", composition: "95% Viscose, 5% Elastane", care: "Machine wash 30°C, gentle. Dry flat.",
    fit: "SLIM", season: "ALL_SEASON", occasions: ["CASUAL", "WORK"], pattern: "TEXTURED", modelInfo: "Model is 172 cm and wears S",
    short: "Second-skin rib top with a square neckline.", features: ["Fine rib", "Square neck", "Stretch fit"],
    tags: ["new-arrival"], attributes: ["neckline:Square", "sleeve:Long"],
  },
  {
    slug: "satin-slip-midi-dress", name: "Satin Slip Midi Dress", styleCode: "RQ-DR-001", category: "women-dresses", brand: "rooq-studio",
    department: "WOMEN", kind: "dress", price: 4290, compareAtPrice: 4990, colors: ["burgundy", "black", "sage"], sizes: ["alpha-xs", "alpha-s", "alpha-m", "alpha-l", "alpha-xl"],
    material: "Satin", composition: "100% Recycled polyester", care: "Hand wash cold. Hang to dry. Cool iron on reverse.",
    fit: "REGULAR", season: "ALL_SEASON", occasions: ["PARTY", "WEDDING"], pattern: "SOLID", modelInfo: "Model is 175 cm and wears S",
    short: "Bias-cut satin slip that skims, never clings.", features: ["Bias cut", "Adjustable straps", "Midi length"],
    tags: ["best-seller", "sustainable"], attributes: ["neckline:V-neck", "sleeve:Sleeveless"], featured: true,
  },
  {
    slug: "wrap-linen-dress", name: "Wrap Linen Dress", styleCode: "RQ-DR-002", category: "women-dresses", brand: "rooq",
    department: "WOMEN", kind: "dress", price: 4590, colors: ["sand", "white", "rust"], sizes: SIZE_RUNS.alphaCore,
    material: "Linen blend", composition: "55% Linen, 45% Viscose", care: "Machine wash 30°C, gentle. Line dry.",
    fit: "RELAXED", season: "SPRING_SUMMER", occasions: ["CASUAL", "TRAVEL"], pattern: "SOLID", modelInfo: "Model is 170 cm and wears S",
    short: "Easy wrap silhouette in breathable linen.", features: ["True wrap with tie", "Flutter sleeves", "Side pockets"],
    tags: ["new-arrival"], attributes: ["neckline:V-neck", "sleeve:Short"],
  },
  {
    slug: "high-rise-wide-leg-jeans", name: "High-Rise Wide-Leg Jeans", styleCode: "RQ-JN-002", category: "women-jeans", brand: "northline",
    department: "WOMEN", kind: "trousers", price: 3790, colors: ["indigo", "ecru"], sizes: SIZE_RUNS.waistWomen,
    material: "Rigid denim, 12 oz", composition: "100% Cotton", care: DENIM_CARE, fit: "RELAXED", season: "ALL_SEASON",
    occasions: ["CASUAL"], pattern: "SOLID", modelInfo: "Model is 174 cm and wears 28",
    short: "A high waist and a full, floor-grazing wide leg.", features: ["High rise", "Wide leg", "Rigid cotton denim"],
  },
  {
    slug: "wool-blend-tailored-coat", name: "Wool-Blend Tailored Coat", styleCode: "RQ-OW-002", category: "women-outerwear", brand: "rooq-studio",
    department: "WOMEN", kind: "outerwear", price: 9990, colors: ["camel", "charcoal"], sizes: SIZE_RUNS.alphaCore,
    material: "Wool blend", composition: "60% Wool, 30% Polyamide, 10% Cashmere", care: "Dry clean only.",
    fit: "REGULAR", season: "AUTUMN_WINTER", occasions: ["WORK", "FORMAL"], pattern: "SOLID", modelInfo: "Model is 176 cm and wears S",
    short: "Single-breasted coat with a soft, structured shoulder.", features: ["Notch lapel", "Fully lined", "Cashmere blend"],
    featured: true,
  },
  {
    slug: "kids-everyday-tee", name: "Kids Everyday Tee", styleCode: "RQ-KT-001", category: "kids-t-shirts", brand: "rooq",
    department: "KIDS", kind: "tee", price: 890, colors: ["sky-blue", "rust", "white"], sizes: SIZE_RUNS.alphaCore,
    material: "Cotton jersey", composition: "100% Organic cotton", care: COTTON_CARE, fit: "REGULAR", season: "ALL_SEASON",
    occasions: ["CASUAL"], pattern: "SOLID", short: "Soft organic tee built for playground days.",
    features: ["Organic cotton", "Taped neck", "Pre-shrunk"], tags: ["sustainable"], attributes: ["neckline:Crew", "sleeve:Short"],
  },
  {
    slug: "canvas-tote-bag", name: "Canvas Tote Bag", styleCode: "RQ-AC-001", category: "women-accessories", brand: "rooq",
    department: "UNISEX", kind: "tote", price: 1290, colors: ["ecru", "black"], sizes: SIZE_RUNS.oneSize,
    material: "Heavy canvas", composition: "100% Cotton canvas", care: "Spot clean.", season: "ALL_SEASON",
    occasions: ["CASUAL", "TRAVEL"], pattern: "SOLID", short: "Roomy 14 oz canvas tote with an inner pocket.",
    features: ["14 oz canvas", "Inner zip pocket", "Fits a 15\" laptop"],
  },
  {
    slug: "merino-beanie", name: "Merino Beanie", styleCode: "RQ-AC-002", category: "men-accessories", brand: "northline",
    department: "UNISEX", kind: "beanie", price: 990, compareAtPrice: 1290, colors: ["charcoal", "rust", "navy"], sizes: SIZE_RUNS.oneSize,
    material: "Merino wool", composition: "100% Merino wool", care: "Hand wash cold. Dry flat.", season: "AUTUMN_WINTER",
    occasions: ["CASUAL", "TRAVEL"], pattern: "TEXTURED", short: "Fine-gauge merino beanie with a deep cuff.",
    features: ["Extra-fine merino", "Turn-up cuff", "Naturally temperature-regulating"],
  },
];
