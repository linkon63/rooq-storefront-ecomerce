import "server-only";
import { createHash } from "node:crypto";
import { Prisma, type PrismaClient } from "@/lib/generated/prisma/client";
import { mediaUrl } from "@/utils/media-url";
import { prisma as defaultPrisma } from "../prisma";
import { processImage } from "./process-image";

export type SavedMedia = {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  mimeType: string;
  sizeBytes: number | null;
};

export type SaveImageOptions = {
  alt?: string | null;
  uploadedById?: string | null;
  /** Pass a client when running inside a transaction or a script. */
  db?: Pick<PrismaClient, "media">;
};

const savedSelect = { id: true, alt: true, width: true, height: true, mimeType: true, sizeBytes: true } as const;

/**
 * Processes an image (WebP, ≤1600 px) and stores it as Media + MediaBlob.
 * Identical bytes are stored once: an existing row with the same sha256 is
 * returned instead of a duplicate.
 */
export async function saveImage(input: Buffer | Uint8Array, options: SaveImageOptions = {}): Promise<SavedMedia> {
  const db = options.db ?? defaultPrisma;
  const image = await processImage(input);
  const checksum = createHash("sha256").update(image.buffer).digest("hex");

  const findExisting = () =>
    db.media.findUnique({ where: { checksum_provider: { checksum, provider: "DATABASE" } }, select: savedSelect });
  const existing = await findExisting();
  if (existing) return { ...existing, url: mediaUrl(existing.id) };

  const created = await db.media
    .create({
    data: {
      kind: "IMAGE",
      provider: "DATABASE",
      mimeType: image.mimeType,
      alt: options.alt ?? null,
      width: image.width,
      height: image.height,
      sizeBytes: image.sizeBytes,
      checksum,
      uploadedById: options.uploadedById ?? null,
      blob: { create: { data: new Uint8Array(image.buffer) } },
    },
    select: savedSelect,
    })
    .catch(async (error: unknown) => {
      // A concurrent upload of the same bytes won the unique (checksum, provider) race.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const winner = await findExisting();
        if (winner) return winner;
      }
      throw error;
    });
  return { ...created, url: mediaUrl(created.id) };
}

export type SaveExternalOptions = {
  kind?: "IMAGE" | "VIDEO";
  mimeType?: string;
  alt?: string | null;
  db?: Pick<PrismaClient, "media">;
};

/** Registers a URL we do not host (video, OAuth avatar) as an EXTERNAL media row. */
export async function saveExternalMedia(url: string, options: SaveExternalOptions = {}): Promise<SavedMedia> {
  const db = options.db ?? defaultPrisma;
  const kind = options.kind ?? "IMAGE";
  const created = await db.media.create({
    data: {
      kind,
      provider: "EXTERNAL",
      externalUrl: url,
      mimeType: options.mimeType ?? (kind === "VIDEO" ? "video/mp4" : "image/jpeg"),
      alt: options.alt ?? null,
    },
    select: savedSelect,
  });
  return { ...created, url };
}
