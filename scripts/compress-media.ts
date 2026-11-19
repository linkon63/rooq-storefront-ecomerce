/**
 * One-off: re-encodes stored images larger than IMAGE_MAX_BYTES so they fit
 * the budget. Rows keep their id, so every product/banner link stays valid.
 * Safe to rerun (already-small images are skipped).
 *
 *   pnpm exec tsx --conditions=react-server scripts/compress-media.ts [--dry-run]
 */
import "dotenv/config";
import { createHash } from "node:crypto";
import { prisma } from "../lib/server/prisma";
import { processImage } from "../lib/server/media/process-image";
import { IMAGE_MAX_BYTES } from "../lib/constants/media";

const dryRun = process.argv.includes("--dry-run");
const kb = (bytes: number) => `${Math.round(bytes / 1000)} KB`;

async function main() {
  const rows = await prisma.$queryRaw<{ id: string; size: number }[]>`
    SELECT m.id, octet_length(b.data)::int AS size
    FROM media m JOIN media_blobs b ON b.media_id = m.id
    WHERE m.provider = 'DATABASE' AND octet_length(b.data) > ${IMAGE_MAX_BYTES}
    ORDER BY size DESC`;
  console.log(`${rows.length} image(s) over ${kb(IMAGE_MAX_BYTES)}${dryRun ? " (dry run)" : ""}`);

  for (const row of rows) {
    const blob = await prisma.mediaBlob.findUniqueOrThrow({ where: { mediaId: row.id }, select: { data: true } });
    const image = await processImage(blob.data);
    const checksum = createHash("sha256").update(image.buffer).digest("hex");
    console.log(`${row.id}: ${kb(row.size)} → ${kb(image.sizeBytes)} (${image.width}×${image.height})`);
    if (dryRun || image.sizeBytes >= row.size) continue;

    await prisma.$transaction([
      prisma.mediaBlob.update({ where: { mediaId: row.id }, data: { data: new Uint8Array(image.buffer) } }),
      prisma.media.update({
        where: { id: row.id },
        data: { width: image.width, height: image.height, sizeBytes: image.sizeBytes, mimeType: image.mimeType, checksum },
      }),
    ]);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
