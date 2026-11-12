import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { optionalText, requiredString } from "../schema-helpers";

export const supplierCreateSchema = z.strictObject({
  name: requiredString("name"),
  phone: optionalText,
  email: optionalText,
  address: optionalText,
  isActive: z.boolean().optional(),
});
export const supplierUpdateSchema = supplierCreateSchema.partial();

const withCount = { _count: { select: { products: true } } } as const;

export function createSupplier(input: z.output<typeof supplierCreateSchema>) {
  return prisma.supplier.create({ data: { ...input, isActive: input.isActive ?? true }, include: withCount });
}

export function listSuppliers() {
  return prisma.supplier.findMany({ orderBy: { createdAt: "desc" }, include: withCount });
}

export async function getSupplier(id: string) {
  const supplier = await prisma.supplier.findUnique({ where: { id }, include: withCount });
  if (!supplier) throw notFound(ERROR_MESSAGES.supplier.notFound(id));
  return supplier;
}

export async function updateSupplier(id: string, input: z.output<typeof supplierUpdateSchema>) {
  await getSupplier(id);
  return prisma.supplier.update({ where: { id }, data: input, include: withCount });
}

/** Products keep their history; the FK is SetNull. */
export async function removeSupplier(id: string) {
  await getSupplier(id);
  return prisma.supplier.delete({ where: { id } });
}
