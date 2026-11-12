import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { slugify } from "@/utils/slug";
import { requiredString, slugField } from "../schema-helpers";

export const attributeCreateSchema = z.strictObject({
  name: requiredString("name"),
  slug: slugField.optional(),
  sortOrder: z.coerce.number().int().optional(),
});
export const attributeUpdateSchema = attributeCreateSchema.partial();
export const attributeValueCreateSchema = z.strictObject({ value: requiredString("value"), sortOrder: z.coerce.number().int().optional() });
export const attributeValueUpdateSchema = attributeValueCreateSchema.partial();

type AttributeInput = z.output<typeof attributeUpdateSchema>;
type ValueInput = z.output<typeof attributeValueUpdateSchema>;

const valuesInclude = { values: { orderBy: [{ sortOrder: "asc" as const }, { value: "asc" as const }] } };

export function listAttributes() {
  return prisma.attribute.findMany({ include: valuesInclude, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getAttribute(id: string) {
  const attribute = await prisma.attribute.findUnique({ where: { id }, include: valuesInclude });
  if (!attribute) throw notFound(ERROR_MESSAGES.attribute.notFound(id));
  return attribute;
}

export function createAttribute(input: z.output<typeof attributeCreateSchema>) {
  return prisma.attribute.create({ data: { ...input, slug: input.slug ?? slugify(input.name) }, include: valuesInclude });
}

export async function updateAttribute(id: string, input: AttributeInput) {
  await getAttribute(id);
  return prisma.attribute.update({ where: { id }, data: input, include: valuesInclude });
}

export async function removeAttribute(id: string) {
  await getAttribute(id);
  await prisma.attribute.delete({ where: { id } });
  return { message: SUCCESS_MESSAGES.common.deleted("Attribute") };
}

export async function createAttributeValue(attributeId: string, input: z.output<typeof attributeValueCreateSchema>) {
  await getAttribute(attributeId);
  return prisma.attributeValue.create({ data: { ...input, attributeId } });
}

export async function listAttributeValues(attributeId: string) {
  return prisma.attributeValue.findMany({ where: { attributeId }, orderBy: [{ sortOrder: "asc" }, { value: "asc" }] });
}

async function findValue(id: string) {
  const value = await prisma.attributeValue.findUnique({ where: { id }, select: { id: true } });
  if (!value) throw notFound(ERROR_MESSAGES.attribute.valueNotFound(id));
}

export async function updateAttributeValue(id: string, input: ValueInput) {
  await findValue(id);
  return prisma.attributeValue.update({ where: { id }, data: input });
}

export async function removeAttributeValue(id: string) {
  await findValue(id);
  await prisma.attributeValue.delete({ where: { id } });
  return { message: SUCCESS_MESSAGES.common.deleted("Attribute value") };
}
