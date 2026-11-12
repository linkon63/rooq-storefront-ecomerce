import "server-only";
import { prisma } from "@/lib/server/prisma";
import { conflict, notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { slugify } from "@/utils/slug";
import { toColorResponse } from "@/utils/mappers/color-size";
import type { ColorCreateInput, ColorListQuery, ColorUpdateInput } from "./schemas";

const colorSelect = {
  id: true, slug: true, name: true, hex: true, family: true, sortOrder: true, isActive: true, createdAt: true, updatedAt: true,
  _count: { select: { variants: true } },
} as const;

async function assertNameFree(name: string | undefined, exceptId?: string) {
  if (!name) return;
  const clash = await prisma.color.findFirst({ where: { name: { equals: name, mode: "insensitive" } }, select: { id: true } });
  if (clash && clash.id !== exceptId) throw conflict(ERROR_MESSAGES.color.nameExists);
}

export async function listColors(query: ColorListQuery) {
  const rows = await prisma.color.findMany({
    where: {
      ...(query.active !== undefined ? { isActive: query.active } : {}),
      ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
    },
    select: colorSelect,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map(toColorResponse);
}

export async function getColor(id: string) {
  const row = await prisma.color.findUnique({ where: { id }, select: colorSelect });
  if (!row) throw notFound(ERROR_MESSAGES.color.notFound(id));
  return toColorResponse(row);
}

export async function createColor(input: ColorCreateInput) {
  await assertNameFree(input.name);
  const row = await prisma.color.create({ data: { ...input, slug: input.slug ?? slugify(input.name) }, select: colorSelect });
  return toColorResponse(row);
}

export async function updateColor(id: string, input: ColorUpdateInput) {
  await getColor(id);
  await assertNameFree(input.name, id);
  const row = await prisma.color.update({ where: { id }, data: input, select: colorSelect });
  return toColorResponse(row);
}

export async function removeColor(id: string) {
  const color = await getColor(id);
  if (color.variantCount > 0) throw conflict(ERROR_MESSAGES.color.inUse);
  await prisma.color.delete({ where: { id } });
  return { message: SUCCESS_MESSAGES.common.deleted("Colour") };
}
