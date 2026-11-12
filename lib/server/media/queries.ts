import "server-only";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { prisma } from "../prisma";
import { notFound } from "../http-error";

export type ServableMedia = {
  mimeType: string;
  checksum: string | null;
  provider: "DATABASE" | "EXTERNAL";
  externalUrl: string | null;
  data: Uint8Array<ArrayBuffer>;
};

const uuid = z.uuid();

/** The only query that reads media bytes. 404s on bad ids and missing rows. */
export async function getMediaForServing(id: string): Promise<ServableMedia> {
  if (!uuid.safeParse(id).success) throw notFound(ERROR_MESSAGES.media.notFound);

  const media = await prisma.media.findUnique({
    where: { id },
    select: {
      mimeType: true,
      checksum: true,
      provider: true,
      externalUrl: true,
      blob: { select: { data: true } },
    },
  });
  if (!media) throw notFound(ERROR_MESSAGES.media.notFound);
  if (media.provider === "EXTERNAL") {
    return { ...media, data: new Uint8Array(new ArrayBuffer(0)) };
  }
  if (!media.blob) throw notFound(ERROR_MESSAGES.media.notFound);

  // Copy into a plain ArrayBuffer-backed view (Response bodies reject SharedArrayBuffer views).
  const data = new Uint8Array(media.blob.data.byteLength);
  data.set(media.blob.data);
  return { mimeType: media.mimeType, checksum: media.checksum, provider: media.provider, externalUrl: null, data };
}
