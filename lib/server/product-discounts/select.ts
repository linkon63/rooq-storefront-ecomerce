import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { mediaRefSelect } from "../media/select";

export const productDiscountSelect = {
  id: true,
  name: true,
  type: true,
  value: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductDiscountSelect;

/** A linked product as the discount screens show it — never the image bytes. */
export const discountProductSelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  price: true,
  compareAtPrice: true,
  brand: { select: { id: true, name: true, slug: true } },
  category: { select: { id: true, name: true, slug: true } },
  media: {
    select: { media: { select: mediaRefSelect } },
    orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
    take: 1,
  },
  variants: {
    where: { isActive: true },
    select: { id: true, sku: true, price: true, compareAtPrice: true, stock: true, isActive: true },
  },
} satisfies Prisma.ProductSelect;

export const productDiscountDetailSelect = {
  ...productDiscountSelect,
  products: {
    select: { discountId: true, productId: true, createdAt: true, product: { select: discountProductSelect } },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.ProductDiscountSelect;
