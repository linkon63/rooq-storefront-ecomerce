import "server-only";
import { prisma } from "@/lib/server/prisma";
import { notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { toLook } from "@/utils/mappers/collection";
import { assertIdsExist } from "../references";
import { resolveMediaRef } from "../media";
import type { Tx } from "../selects";
import { cardMap, lookSelect } from "./queries";
import type { LookCreateInput, LookUpdateInput } from "./schemas";

async function setItems(tx: Tx, lookId: string, productIds: string[]) {
  await tx.collectionLookItem.deleteMany({ where: { lookId } });
  const ids = [...new Set(productIds)];
  if (ids.length) await tx.collectionLookItem.createMany({ data: ids.map((productId, position) => ({ lookId, productId, position })) });
}

async function validate(input: LookUpdateInput) {
  await assertIdsExist((ids) => prisma.product.count({ where: { id: { in: ids } } }), input.productIds, ERROR_MESSAGES.product.someNotFound);
  return resolveMediaRef({ url: input.imageUrl, mediaId: input.mediaId });
}

async function lookResponse(id: string) {
  const look = await prisma.collectionLook.findUniqueOrThrow({ where: { id }, select: lookSelect });
  return toLook(look, await cardMap(look.items.map((item) => item.productId)));
}

/** POST /collections/:id/looks — a "shop the look" scene. */
export async function createLook(collectionId: string, input: LookCreateInput) {
  const collection = await prisma.collection.findUnique({ where: { id: collectionId }, select: { id: true } });
  if (!collection) throw notFound(ERROR_MESSAGES.collection.notFound(collectionId));
  const mediaId = await validate(input);
  const id = await prisma.$transaction(async (tx) => {
    const last = await tx.collectionLook.aggregate({ where: { collectionId }, _max: { position: true } });
    const look = await tx.collectionLook.create({
      data: {
        collectionId,
        title: input.title ?? null,
        description: input.description ?? null,
        mediaId: mediaId ?? null,
        position: input.position ?? (last._max.position ?? -1) + 1,
      },
      select: { id: true },
    });
    await setItems(tx, look.id, input.productIds);
    return look.id;
  });
  return lookResponse(id);
}

export async function updateLook(id: string, input: LookUpdateInput) {
  const exists = await prisma.collectionLook.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw notFound(ERROR_MESSAGES.collection.lookNotFound(id));
  const mediaId = await validate(input);
  await prisma.$transaction(async (tx) => {
    await tx.collectionLook.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.position !== undefined ? { position: input.position } : {}),
        ...(mediaId !== undefined ? { mediaId } : {}),
      },
    });
    if (input.productIds) await setItems(tx, id, input.productIds);
  });
  return lookResponse(id);
}

export async function removeLook(id: string) {
  const exists = await prisma.collectionLook.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw notFound(ERROR_MESSAGES.collection.lookNotFound(id));
  await prisma.collectionLook.delete({ where: { id } });
  return { message: SUCCESS_MESSAGES.common.deleted("Look") };
}
