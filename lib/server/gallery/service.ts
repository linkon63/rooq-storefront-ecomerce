import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { GALLERY_MAX_PHOTOS, GALLERY_PAGE_SIZE } from "@/lib/constants/gallery";
import { badRequest, notFound } from "@/lib/server/http-error";
import { mediaRefSelect } from "@/lib/server/media/select";
import { releaseMedia } from "@/lib/server/media/release";
import { notifyStaff, safely } from "@/lib/server/orders/notify";
import { prisma } from "@/lib/server/prisma";
import { toAdminGalleryEntry, toPublicGalleryEntry } from "@/utils/mappers/gallery";
import type { GalleryAdminCreateInput, GalleryAdminQuery, GallerySubmitInput } from "./schemas";
import type { GallerySource, GalleryStatus } from "@/types/gallery";

const entrySelect = {
  id: true,
  name: true,
  city: true,
  rating: true,
  feedback: true,
  source: true,
  status: true,
  contactPhone: true,
  consentAt: true,
  createdAt: true,
  images: { orderBy: { position: "asc" }, select: { media: { select: { ...mediaRefSelect } } } },
} as const satisfies Prisma.CustomerGalleryEntrySelect;

function assertPhotoCount(mediaIds: readonly string[]): void {
  if (mediaIds.length === 0) throw badRequest(ERROR_MESSAGES.gallery.photoRequired);
  if (mediaIds.length > GALLERY_MAX_PHOTOS) throw badRequest(ERROR_MESSAGES.gallery.tooManyPhotos(GALLERY_MAX_PHOTOS));
}

/** Approved entries for the storefront, newest first. */
export async function listPublicGallery(source?: GallerySource) {
  const rows = await prisma.customerGalleryEntry.findMany({
    where: { status: "APPROVED", ...(source ? { source } : {}) },
    orderBy: { createdAt: "desc" },
    take: GALLERY_PAGE_SIZE * 4,
    select: entrySelect,
  });
  return rows.map(toPublicGalleryEntry);
}

/** Every entry for staff, filtered by status/source. */
export async function listAdminGallery(query: GalleryAdminQuery) {
  const rows = await prisma.customerGalleryEntry.findMany({
    where: { ...(query.status ? { status: query.status } : {}), ...(query.source ? { source: query.source } : {}) },
    orderBy: { createdAt: "desc" },
    select: entrySelect,
  });
  return rows.map(toAdminGalleryEntry);
}

/** A shopper's submission: saved as PENDING until staff approve it. */
export async function submitGalleryEntry(input: GallerySubmitInput, mediaIds: readonly string[]) {
  assertPhotoCount(mediaIds);
  const row = await prisma.customerGalleryEntry.create({
    data: {
      name: input.name,
      city: input.city ?? null,
      rating: input.rating,
      feedback: input.feedback,
      contactPhone: input.contactPhone ?? null,
      source: "WEBSITE",
      status: "PENDING",
      consentAt: new Date(),
      images: { create: mediaIds.map((mediaId, position) => ({ mediaId, position })) },
    },
    select: { id: true },
  });
  await safely(
    () =>
      notifyStaff({
        type: "REVIEW",
        title: "New customer photo submitted",
        message: `${input.name} shared a photo and ${input.rating}-star feedback. Review it before it goes live.`,
        link: "/admin/customer-gallery",
      }),
    `gallery ${row.id}`,
  );
  return { message: SUCCESS_MESSAGES.gallery.submitted };
}

/** Staff add an entry (e.g. a Facebook screenshot); it goes live right away. */
export async function createAdminGalleryEntry(input: GalleryAdminCreateInput, mediaIds: readonly string[]) {
  assertPhotoCount(mediaIds);
  const row = await prisma.customerGalleryEntry.create({
    data: {
      name: input.name,
      city: input.city ?? null,
      rating: input.rating,
      feedback: input.feedback,
      contactPhone: input.contactPhone ?? null,
      source: input.source,
      status: "APPROVED",
      consentAt: new Date(),
      images: { create: mediaIds.map((mediaId, position) => ({ mediaId, position })) },
    },
    select: entrySelect,
  });
  return toAdminGalleryEntry(row);
}

export async function setGalleryStatus(id: string, status: GalleryStatus) {
  const exists = await prisma.customerGalleryEntry.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw notFound(ERROR_MESSAGES.gallery.notFound(id));
  const row = await prisma.customerGalleryEntry.update({ where: { id }, data: { status }, select: entrySelect });
  return toAdminGalleryEntry(row);
}

export async function deleteGalleryEntry(id: string) {
  const row = await prisma.customerGalleryEntry.findUnique({ where: { id }, select: { images: { select: { mediaId: true } } } });
  if (!row) throw notFound(ERROR_MESSAGES.gallery.notFound(id));
  await prisma.customerGalleryEntry.delete({ where: { id } });
  await releaseMedia(row.images.map((image) => image.mediaId));
  return { message: SUCCESS_MESSAGES.gallery.deleted };
}
