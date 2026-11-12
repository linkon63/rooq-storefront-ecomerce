import "server-only";
import { z } from "zod";
import { Department, Fit, Occasion, Pattern, ProductStatus, Season } from "@/lib/generated/prisma/enums";
import { PRODUCT_SORTS } from "@/lib/constants/catalog";
import { paginationQuery, queryBoolean, queryList } from "@/lib/server/validation";
import { enumList } from "../schema-helpers";

/** GET /products — every shop filter, sort and facet switch (see fashion-api-contract.md). */
export const productListQuery = z.object({
  ...paginationQuery,
  search: z.string().trim().optional(),
  q: z.string().trim().optional(),
  category: queryList.optional(),
  categoryId: z.uuid().optional(),
  brandId: z.uuid().optional(),
  department: enumList(Department).optional(),
  size: queryList.optional(),
  color: queryList.optional(),
  brand: queryList.optional(),
  material: queryList.optional(),
  fit: enumList(Fit).optional(),
  pattern: enumList(Pattern).optional(),
  season: enumList(Season).optional(),
  occasion: enumList(Occasion).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: queryBoolean.optional(),
  onSale: queryBoolean.optional(),
  new: queryBoolean.optional(),
  collection: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  sort: z.enum(PRODUCT_SORTS).optional(),
  facets: queryBoolean.optional(),
  scope: z.enum(["admin", "public"]).optional(),
  includeArchived: queryBoolean.optional(),
  status: z.enum(ProductStatus).optional(),
  featured: queryBoolean.optional(),
  /** Explicit ids (wishlist / compare / recently viewed hydrate cards this way). */
  ids: queryList.optional(),
});

export type ProductListQuery = z.output<typeof productListQuery>;
