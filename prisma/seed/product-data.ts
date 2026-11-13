import type { Department, Fit, Occasion, Pattern, Season } from "../../lib/generated/prisma/enums";
import type { ColorSlug } from "./masters";
import type { GarmentKind } from "./placeholder-art";
import { SAREE_PRODUCTS } from "./saree-data";

export type ProductSeed = {
  slug: string;
  name: string;
  styleCode: string;
  category: string;
  brand: string;
  department: Department;
  /** Placeholder artwork shape; not needed when `photos` is set. */
  kind?: GarmentKind;
  /** Folder under data/product-photos holding this product's real photos (01.jpg is the cover). */
  photos?: string;
  /** Opening stock per variant; leave out for the demo pseudo-random spread. */
  stock?: number;
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

/** The catalogue: real products with real photos (see saree-data.ts). */
export const PRODUCTS: ProductSeed[] = SAREE_PRODUCTS;
