import { mediaSrc, type MediaRef } from "@/utils/media-url";
import type { AdminGalleryEntry, GalleryImage, GallerySource, GalleryStatus, PublicGalleryEntry } from "@/types/gallery";

type GalleryRow = {
  id: string;
  name: string;
  city: string | null;
  rating: number;
  feedback: string;
  source: GallerySource;
  status: GalleryStatus;
  contactPhone: string | null;
  consentAt: Date;
  createdAt: Date;
  images: { media: MediaRef & { alt: string | null; width: number | null; height: number | null } }[];
};

function toImage(media: GalleryRow["images"][number]["media"]): GalleryImage {
  return { id: media.id, url: mediaSrc(media) ?? "", alt: media.alt, width: media.width, height: media.height };
}

export function toPublicGalleryEntry(row: GalleryRow): PublicGalleryEntry {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    rating: row.rating,
    feedback: row.feedback,
    source: row.source,
    images: row.images.map((image) => toImage(image.media)),
    createdAt: row.createdAt.toISOString(),
  };
}

export function toAdminGalleryEntry(row: GalleryRow): AdminGalleryEntry {
  return { ...toPublicGalleryEntry(row), status: row.status, contactPhone: row.contactPhone, consentAt: row.consentAt.toISOString() };
}
