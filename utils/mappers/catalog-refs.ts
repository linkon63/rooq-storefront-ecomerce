import type { SizeGroup } from "@/lib/generated/prisma/enums";
import { mediaSrc, type MediaRef } from "@/utils/media-url";

/** Prisma Decimal, or a number/string that already left the DB. */
export type DecimalLike = { toNumber(): number } | number | string;

export function toNum(value: DecimalLike): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

export function toNumOrNull(value: DecimalLike | null | undefined): number | null {
  return value === null || value === undefined ? null : toNum(value);
}

/** Row produced by `mediaRefSelect`. */
export type MediaRow = MediaRef & { alt: string | null; width: number | null; height: number | null };

export type Image = { id: string; url: string; alt: string | null; width: number | null; height: number | null };

export function toImage(media: MediaRow | null | undefined): Image | null {
  const url = mediaSrc(media);
  if (!media || !url) return null;
  return { id: media.id, url, alt: media.alt, width: media.width, height: media.height };
}

export type ColorRef = { id: string; slug: string; name: string; hex: string };
export type SizeRef = { id: string; slug: string; label: string; sizeGroup: SizeGroup; sortOrder: number };

export function toColorRef(color: ColorRef): ColorRef {
  return { id: color.id, slug: color.slug, name: color.name, hex: color.hex };
}

export function toSizeRef(size: SizeRef): SizeRef {
  return { id: size.id, slug: size.slug, label: size.label, sizeGroup: size.sizeGroup, sortOrder: size.sortOrder };
}

export type NamedRef = { id: string; slug: string; name: string };

export function toNamedRef(row: NamedRef): NamedRef {
  return { id: row.id, slug: row.slug, name: row.name };
}
