import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { DEFAULT_ADDRESS } from "@/lib/constants/address";
import type { Prisma } from "@/lib/generated/prisma/client";
import { normalizeBdPhone } from "@/utils/phone";
import { toAddressResponse, type AddressResponse } from "@/utils/mappers/address";
import { prisma } from "../prisma";
import { notFound } from "../http-error";
import type { CreateAddressInput, UpdateAddressInput } from "./schemas";

async function findOwned(id: string, userId: string) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw notFound(ERROR_MESSAGES.address.notFound);
  return address;
}

export async function createAddress(userId: string, input: CreateAddressInput): Promise<AddressResponse> {
  return prisma.$transaction(async (tx) => {
    // The first address a customer saves becomes the default.
    const isDefault = input.isDefault ?? (await tx.address.count({ where: { userId } })) === 0;
    if (isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    const address = await tx.address.create({
      data: {
        userId,
        label: input.label || null,
        fullName: input.fullName,
        phone: normalizeBdPhone(input.phone) || input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || null,
        city: input.city || input.state || DEFAULT_ADDRESS.city,
        state: input.state || DEFAULT_ADDRESS.state,
        postalCode: input.postalCode || null,
        country: input.country || DEFAULT_ADDRESS.country,
        isDefault,
      },
    });
    return toAddressResponse(address);
  });
}

/** Default address first, then most recent. */
export async function listAddresses(userId: string): Promise<AddressResponse[]> {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return addresses.map(toAddressResponse);
}

export async function getAddress(id: string, userId: string): Promise<AddressResponse> {
  return toAddressResponse(await findOwned(id, userId));
}

export async function updateAddress(id: string, userId: string, input: UpdateAddressInput): Promise<AddressResponse> {
  await findOwned(id, userId);
  const data: Prisma.AddressUpdateInput = {};
  for (const key of ["label", "fullName", "addressLine1", "addressLine2", "city", "state", "postalCode", "country"] as const) {
    if (input[key] !== undefined) data[key] = input[key] as string;
  }
  if (input.phone !== undefined) data.phone = normalizeBdPhone(input.phone) || input.phone;
  if (input.isDefault !== undefined) data.isDefault = input.isDefault;

  return prisma.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({ where: { userId, id: { not: id } }, data: { isDefault: false } });
    }
    return toAddressResponse(await tx.address.update({ where: { id }, data }));
  });
}

/**
 * Orders keep a frozen copy of the shipping address (OrderAddress) and the
 * link is ON DELETE SET NULL, so a used address can be removed safely. When
 * the default goes, the most recent remaining address takes over.
 */
export async function removeAddress(id: string, userId: string): Promise<{ message: string }> {
  const address = await findOwned(id, userId);
  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id } });
    if (!address.isDefault) return;
    const next = await tx.address.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true } });
    if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
  });
  return { message: SUCCESS_MESSAGES.common.deleted("Address") };
}

export async function setDefaultAddress(id: string, userId: string): Promise<AddressResponse> {
  await findOwned(id, userId);
  return prisma.$transaction(async (tx) => {
    await tx.address.updateMany({ where: { userId, id: { not: id } }, data: { isDefault: false } });
    return toAddressResponse(await tx.address.update({ where: { id }, data: { isDefault: true } }));
  });
}
