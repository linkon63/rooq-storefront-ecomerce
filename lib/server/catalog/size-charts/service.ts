import "server-only";
import { prisma } from "@/lib/server/prisma";
import { badRequest, notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { CATALOG_TX_OPTIONS } from "@/lib/constants/catalog";
import { slugify } from "@/utils/slug";
import { toSizeChart } from "@/utils/mappers/size-chart";
import { assertIdsExist } from "../references";
import type { Tx } from "../selects";
import { sizeChartAdminSelect, sizeChartSelect } from "./queries";
import type { SizeChartCreateInput, SizeChartRowInput, SizeChartUpdateInput } from "./schemas";

function assertRows(rows: SizeChartRowInput[] | undefined) {
  if (!rows) return;
  const sizes = new Set<string>();
  for (const row of rows) {
    if (sizes.has(row.sizeId)) throw badRequest(ERROR_MESSAGES.sizeChart.duplicateSize);
    sizes.add(row.sizeId);
    const labels = new Set<string>();
    for (const m of row.measurements) {
      const key = m.label.toLowerCase();
      if (labels.has(key)) throw badRequest(ERROR_MESSAGES.sizeChart.duplicateColumn(m.label));
      labels.add(key);
    }
  }
}

async function validate(input: SizeChartUpdateInput) {
  assertRows(input.rows);
  await Promise.all([
    assertIdsExist((ids) => prisma.size.count({ where: { id: { in: ids } } }), input.rows?.map((r) => r.sizeId), ERROR_MESSAGES.size.someNotFound),
    assertIdsExist(
      (ids) => prisma.category.count({ where: { id: { in: ids } } }),
      input.categoryIds,
      ERROR_MESSAGES.category.unknownIds(input.categoryIds ?? []),
    ),
  ]);
}

/** Replace every row + measurement of a chart. */
async function replaceRows(tx: Tx, sizeChartId: string, rows: SizeChartRowInput[]) {
  await tx.sizeChartRow.deleteMany({ where: { sizeChartId } });
  for (const [position, row] of rows.entries()) {
    await tx.sizeChartRow.create({
      data: {
        sizeChartId,
        sizeId: row.sizeId,
        position,
        measurements: { create: row.measurements.map((m, index) => ({ label: m.label, valueCm: m.valueCm, position: index })) },
      },
    });
  }
}

async function linkCategories(tx: Tx, sizeChartId: string, categoryIds: string[]) {
  await tx.category.updateMany({ where: { sizeChartId, id: { notIn: categoryIds } }, data: { sizeChartId: null } });
  if (categoryIds.length) await tx.category.updateMany({ where: { id: { in: categoryIds } }, data: { sizeChartId } });
}

export async function listSizeCharts() {
  const rows = await prisma.sizeChart.findMany({ select: sizeChartAdminSelect, orderBy: { name: "asc" } });
  return rows.map(toSizeChart);
}

export async function getSizeChart(id: string, admin: boolean) {
  const row = admin
    ? await prisma.sizeChart.findUnique({ where: { id }, select: sizeChartAdminSelect })
    : await prisma.sizeChart.findFirst({ where: { id, isActive: true }, select: sizeChartSelect });
  if (!row) throw notFound(ERROR_MESSAGES.sizeChart.notFound(id));
  return toSizeChart(row);
}

export async function createSizeChart(input: SizeChartCreateInput) {
  await validate(input);
  const { rows, categoryIds, ...fields } = input;
  const id = await prisma.$transaction(async (tx) => {
    const chart = await tx.sizeChart.create({ data: { ...fields, slug: fields.slug ?? slugify(fields.name) }, select: { id: true } });
    await replaceRows(tx, chart.id, rows);
    if (categoryIds) await linkCategories(tx, chart.id, categoryIds);
    return chart.id;
  }, CATALOG_TX_OPTIONS);
  return getSizeChart(id, true);
}

export async function updateSizeChart(id: string, input: SizeChartUpdateInput) {
  const exists = await prisma.sizeChart.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw notFound(ERROR_MESSAGES.sizeChart.notFound(id));
  await validate(input);
  const { rows, categoryIds, ...fields } = input;
  await prisma.$transaction(async (tx) => {
    if (Object.keys(fields).length) await tx.sizeChart.update({ where: { id }, data: fields });
    if (rows) await replaceRows(tx, id, rows);
    if (categoryIds) await linkCategories(tx, id, categoryIds);
  }, CATALOG_TX_OPTIONS);
  return getSizeChart(id, true);
}

/** Categories and products that used it fall back to no chart (FK SetNull). */
export async function removeSizeChart(id: string) {
  const exists = await prisma.sizeChart.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw notFound(ERROR_MESSAGES.sizeChart.notFound(id));
  await prisma.sizeChart.delete({ where: { id } });
  return { message: SUCCESS_MESSAGES.common.deleted("Size chart") };
}
