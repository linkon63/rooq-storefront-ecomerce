import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { badRequest, conflict, notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { optionalText, requiredString } from "../schema-helpers";

export const unitCreateSchema = z.strictObject({
  name: requiredString("name"),
  code: requiredString("code"),
  description: optionalText,
  isActive: z.boolean().optional(),
  /** null clears the parent (base unit). */
  parentUnitId: z.uuid().nullable().optional(),
  factor: z.coerce.number().positive().optional(),
});
export const unitUpdateSchema = unitCreateSchema.partial();
type UnitInput = z.output<typeof unitUpdateSchema>;

const unitInclude = {
  parentUnit: { select: { id: true, name: true, code: true } },
  _count: { select: { products: true, childUnits: true } },
} as const;

/** A base unit is always 1 of itself; only a child carries a real factor. */
const resolveFactor = (parentUnitId: string | null, factor?: number) => (parentUnitId ? (factor ?? 1) : 1);

async function assertCodeFree(code: string | undefined, exceptId?: string) {
  if (!code) return;
  const existing = await prisma.unit.findUnique({ where: { code }, select: { id: true } });
  if (existing && existing.id !== exceptId) throw conflict(ERROR_MESSAGES.unit.codeExists);
}

async function assertParentExists(parentUnitId: string | null) {
  if (!parentUnitId) return;
  const parent = await prisma.unit.findUnique({ where: { id: parentUnitId }, select: { id: true } });
  if (!parent) throw notFound(ERROR_MESSAGES.unit.parentNotFound(parentUnitId));
}

/** Walk up from the proposed parent; meeting the unit itself means a loop. */
async function assertNoCycle(id: string, parentUnitId: string | null) {
  if (!parentUnitId) return;
  if (parentUnitId === id) throw badRequest(ERROR_MESSAGES.unit.ownParent);
  const units = await prisma.unit.findMany({ select: { id: true, parentUnitId: true } });
  const parentOf = new Map(units.map((u) => [u.id, u.parentUnitId]));
  const seen = new Set<string>([id]);
  let cursor: string | null = parentUnitId;
  while (cursor) {
    if (seen.has(cursor)) throw badRequest(ERROR_MESSAGES.unit.circular);
    seen.add(cursor);
    cursor = parentOf.get(cursor) ?? null;
  }
}

export async function createUnit(input: z.output<typeof unitCreateSchema>) {
  await assertCodeFree(input.code);
  const parentUnitId = input.parentUnitId ?? null;
  await assertParentExists(parentUnitId);
  return prisma.unit.create({
    data: { name: input.name, code: input.code, description: input.description ?? null, isActive: input.isActive ?? true, parentUnitId, factor: resolveFactor(parentUnitId, input.factor) },
    include: unitInclude,
  });
}

export function listUnits() {
  return prisma.unit.findMany({ orderBy: { createdAt: "desc" }, include: unitInclude });
}

export async function getUnit(id: string) {
  const unit = await prisma.unit.findUnique({ where: { id }, include: unitInclude });
  if (!unit) throw notFound(ERROR_MESSAGES.unit.notFound(id));
  return unit;
}

export async function updateUnit(id: string, input: UnitInput) {
  const current = await getUnit(id);
  await assertCodeFree(input.code, id);
  const parentUnitId = input.parentUnitId === undefined ? current.parentUnitId : input.parentUnitId;
  if (parentUnitId !== current.parentUnitId) {
    await assertParentExists(parentUnitId);
    await assertNoCycle(id, parentUnitId);
  }
  const factor =
    input.factor === undefined && parentUnitId === current.parentUnitId ? undefined : resolveFactor(parentUnitId, input.factor ?? Number(current.factor));
  return prisma.unit.update({
    where: { id },
    data: { name: input.name, code: input.code, description: input.description, isActive: input.isActive, parentUnitId, ...(factor === undefined ? {} : { factor }) },
    include: unitInclude,
  });
}

export async function removeUnit(id: string) {
  const unit = await getUnit(id);
  if (unit._count.childUnits > 0) throw conflict(ERROR_MESSAGES.unit.hasChildren(unit.name, unit._count.childUnits));
  return prisma.unit.delete({ where: { id } });
}
