import "server-only";
import type { SizeGroup } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/server/prisma";
import { badRequest, conflict, notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { slugify } from "@/utils/slug";
import { sortSizes } from "@/utils/catalog/sizes";
import { toSizeResponse } from "@/utils/mappers/color-size";
import type { SizeCreateInput, SizeListQuery, SizeUpdateInput } from "./schemas";

const sizeSelect = {
  id: true, slug: true, label: true, sizeGroup: true, sortOrder: true, isActive: true, createdAt: true, updatedAt: true,
  _count: { select: { variants: true, sizeChartRows: true } },
} as const;

/** "alpha-m", "numeric-32", "shoe-42", "one-size-one-size". */
const sizeSlug = (group: SizeGroup, label: string) => slugify(`${group.replace("_", "-")}-${label}`);

async function assertLabelFree(group: SizeGroup, label: string, exceptId?: string) {
  const clash = await prisma.size.findFirst({ where: { sizeGroup: group, label: { equals: label, mode: "insensitive" } }, select: { id: true } });
  if (clash && clash.id !== exceptId) throw conflict(ERROR_MESSAGES.size.labelExists);
}

export async function listSizes(query: SizeListQuery) {
  const rows = await prisma.size.findMany({
    where: { ...(query.group ? { sizeGroup: query.group } : {}), ...(query.active !== undefined ? { isActive: query.active } : {}) },
    select: sizeSelect,
  });
  return sortSizes(rows).map(toSizeResponse);
}

async function findSize(id: string) {
  const row = await prisma.size.findUnique({ where: { id }, select: sizeSelect });
  if (!row) throw notFound(ERROR_MESSAGES.size.notFound(id));
  return row;
}

export async function getSize(id: string) {
  return toSizeResponse(await findSize(id));
}

export async function createSize(input: SizeCreateInput) {
  await assertLabelFree(input.sizeGroup, input.label);
  const last = await prisma.size.aggregate({ where: { sizeGroup: input.sizeGroup }, _max: { sortOrder: true } });
  const row = await prisma.size.create({
    data: {
      ...input,
      slug: input.slug ?? sizeSlug(input.sizeGroup, input.label),
      sortOrder: input.sortOrder ?? (last._max.sortOrder ?? -1) + 1,
    },
    select: sizeSelect,
  });
  return toSizeResponse(row);
}

export async function updateSize(id: string, input: SizeUpdateInput) {
  const current = await findSize(id);
  if (input.label || input.sizeGroup) await assertLabelFree(input.sizeGroup ?? current.sizeGroup, input.label ?? current.label, id);
  const row = await prisma.size.update({ where: { id }, data: input, select: sizeSelect });
  return toSizeResponse(row);
}

export async function reorderSizes(items: { id: string; sortOrder: number }[]) {
  const count = await prisma.size.count({ where: { id: { in: items.map((item) => item.id) } } });
  if (count !== new Set(items.map((item) => item.id)).size) throw badRequest(ERROR_MESSAGES.size.someNotFound);
  await prisma.$transaction(items.map((item) => prisma.size.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })));
  return listSizes({});
}

export async function removeSize(id: string) {
  const size = await findSize(id);
  if (size._count.variants > 0 || size._count.sizeChartRows > 0) throw conflict(ERROR_MESSAGES.size.inUse);
  await prisma.size.delete({ where: { id } });
  return { message: SUCCESS_MESSAGES.common.deleted("Size") };
}
