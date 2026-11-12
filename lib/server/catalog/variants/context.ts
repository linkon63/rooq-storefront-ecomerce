import "server-only";
import { prisma } from "@/lib/server/prisma";
import { notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { toNum, toNumOrNull } from "@/utils/mappers/catalog-refs";
import { pickDiscount } from "@/utils/mappers/product-card";
import type { PriceContext } from "@/utils/mappers/variant";
import { activeDiscountWhere } from "../selects";

export type ProductForVariants = {
  id: string;
  slug: string;
  name: string;
  styleCode: string | null;
  priceCtx: PriceContext;
};

/** The product fields variant maths needs (prices, discount, SKU tokens). */
export async function loadProductForVariants(productId: string): Promise<ProductForVariants> {
  const now = new Date();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      slug: true,
      name: true,
      styleCode: true,
      price: true,
      compareAtPrice: true,
      discounts: { where: { discount: activeDiscountWhere(now) }, select: { discount: { select: { id: true, type: true, value: true } } } },
    },
  });
  if (!product) throw notFound(ERROR_MESSAGES.product.notFound(productId));
  const price = toNum(product.price);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    styleCode: product.styleCode,
    priceCtx: { price, compareAtPrice: toNumOrNull(product.compareAtPrice), discount: pickDiscount(price, product.discounts) },
  };
}
