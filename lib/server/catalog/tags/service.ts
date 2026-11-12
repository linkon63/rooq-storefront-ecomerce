import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { conflict, notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { slugify } from "@/utils/slug";
import { optionalText, requiredString, slugField } from "../schema-helpers";

export const tagCreateSchema = z.strictObject({
  name: requiredString("name"),
  slug: slugField.optional(),
  description: optionalText,
  isActive: z.boolean().optional(),
});
export const tagUpdateSchema = tagCreateSchema.partial();

const withCount = { _count: { select: { products: true } } } as const;

async function assertSlugFree(slug: string, exceptId?: string) {
  const existing = await prisma.tag.findUnique({ where: { slug }, select: { id: true } });
  if (existing && existing.id !== exceptId) throw conflict(ERROR_MESSAGES.tag.slugExists);
}

export async function createTag(input: z.output<typeof tagCreateSchema>) {
  const slug = input.slug ?? slugify(input.name);
  await assertSlugFree(slug);
  return prisma.tag.create({ data: { ...input, slug, isActive: input.isActive ?? true }, include: withCount });
}

export function listTags() {
  return prisma.tag.findMany({ orderBy: { createdAt: "desc" }, include: withCount });
}

export async function getTag(id: string) {
  const tag = await prisma.tag.findUnique({ where: { id }, include: withCount });
  if (!tag) throw notFound(ERROR_MESSAGES.tag.notFound(id));
  return tag;
}

export async function updateTag(id: string, input: z.output<typeof tagUpdateSchema>) {
  await getTag(id);
  if (input.slug) await assertSlugFree(input.slug, id);
  return prisma.tag.update({ where: { id }, data: input, include: withCount });
}

export async function removeTag(id: string) {
  await getTag(id);
  return prisma.tag.delete({ where: { id } });
}
