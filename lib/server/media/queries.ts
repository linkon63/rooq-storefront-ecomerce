import "server-only";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { prisma } from "../prisma";
import { notFound } from "../http-error";
import { readMediaCache, writeMediaCache } from "./memory-cache";

export type ServableMedia = {
  mimeType: string;
  checksum: string | null;
  provider: "DATABASE" | "EXTERNAL";
  externalUrl: string | null;
  data: Uint8Array<ArrayBuffer>;
};

type MediaRow = {
  mime_type: string;
  checksum: string | null;
  provider: "DATABASE" | "EXTERNAL";
  external_url: string | null;
  data: Uint8Array | null;
};

const uuid = z.uuid();

/**
 * The only query that reads media bytes. One round trip (media ⟕ blob), and a
 * per-instance memory cache in front of it. 404s on bad ids and missing rows.
 */
export async function getMediaForServing(id: string): Promise<ServableMedia> {
  if (!uuid.safeParse(id).success) throw notFound(ERROR_MESSAGES.media.notFound);
  const cached = readMediaCache(id);
  if (cached) return cached;

  const [row] = await prisma.$queryRaw<MediaRow[]>`
    SELECT m.mime_type, m.checksum, m.provider::text AS provider, m.external_url, b.data
    FROM media m LEFT JOIN media_blobs b ON b.media_id = m.id
    WHERE m.id = ${id}
    LIMIT 1`;
  if (!row) throw notFound(ERROR_MESSAGES.media.notFound);

  const base = { mimeType: row.mime_type, checksum: row.checksum, provider: row.provider };
  if (row.provider === "EXTERNAL") {
    return { ...base, externalUrl: row.external_url, data: new Uint8Array(new ArrayBuffer(0)) };
  }
  if (!row.data) throw notFound(ERROR_MESSAGES.media.notFound);

  // Copy into a plain ArrayBuffer-backed view (Response bodies reject SharedArrayBuffer views).
  const data = new Uint8Array(row.data.byteLength);
  data.set(row.data);
  return writeMediaCache(id, { ...base, externalUrl: null, data });
}
