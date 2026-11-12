import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";
import { conflict, notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { mediaRefSelect } from "@/lib/server/media/select";
import { slugify } from "@/utils/slug";
import { toBrandResponse } from "@/utils/mappers/brand";
import { releaseMedia } from "@/lib/server/media/release";
import { resolveMediaRef } from "../media";
import type { BrandCreateInput, BrandUpdateInput } from "./schemas";

const brandSelect = {
  id: true, name: true, slug: true, description: true, isActive: true, logoMediaId: true, createdAt: true, updatedAt: true,
  logoMedia: { select: mediaRefSelect },
  _count: { select: { products: true } },
} as const satisfies Prisma.BrandSelect;

async function findBrand(id: string) {
  const row = await prisma.brand.findUnique({ where: { id }, select: brandSelect });
  if (!row) throw notFound(ERROR_MESSAGES.brand.notFound(id));
  return row;
}

function data(input: BrandUpdateInput, logoMediaId: string | null | undefined) {
  const rest = { ...input };
  delete rest.logoUrl;
  delete rest.logoMediaId;
  return { ...rest, ...(logoMediaId !== undefined ? { logoMediaId } : {}) };
}

export async function listBrands() {
  const rows = await prisma.brand.findMany({ select: brandSelect, orderBy: { name: "asc" } });
  return rows.map(toBrandResponse);
}

export async function getBrand(id: string) {
  return toBrandResponse(await findBrand(id));
}

export async function createBrand(input: BrandCreateInput, uploadedMediaId?: string) {
  const logoMediaId = uploadedMediaId ?? (await resolveMediaRef({ url: input.logoUrl || undefined, mediaId: input.logoMediaId }));
  const row = await prisma.brand.create({
    data: { ...data(input, logoMediaId), name: input.name, slug: input.slug ?? slugify(input.name) },
    select: brandSelect,
  });
  return toBrandResponse(row);
}

export async function updateBrand(id: string, input: BrandUpdateInput, uploadedMediaId?: string) {
  const current = await findBrand(id);
  const logoMediaId = uploadedMediaId ?? (await resolveMediaRef({ url: input.logoUrl, mediaId: input.logoMediaId }));
  const row = await prisma.$transaction(async (tx) => {
    const updated = await tx.brand.update({ where: { id }, data: data(input, logoMediaId), select: brandSelect });
    if (logoMediaId !== undefined && current.logoMediaId && current.logoMediaId !== logoMediaId) await releaseMedia(current.logoMediaId, tx);
    return updated;
  });
  return toBrandResponse(row);
}

/** POST /brands/:id/upload-logo */
export function setBrandLogo(id: string, mediaId: string) {
  return updateBrand(id, {}, mediaId);
}

export async function removeBrand(id: string) {
  const brand = await findBrand(id);
  if (brand._count.products > 0) throw conflict(ERROR_MESSAGES.database.foreignKeyDelete("brand"));
  await prisma.$transaction(async (tx) => {
    await tx.brand.delete({ where: { id } });
    await releaseMedia(brand.logoMediaId, tx);
  });
  return toBrandResponse(brand);
}
