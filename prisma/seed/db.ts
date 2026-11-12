import type { PrismaClient } from "../../lib/generated/prisma/client";
import { saveImage } from "../../lib/server/media/save-image";
import { svgToPng } from "./placeholder-art";

export type SeedDb = PrismaClient;

/** Rasterise placeholder SVG → store through the real media pipeline (dedupes by checksum). */
export async function storeSvg(db: SeedDb, svg: string, alt: string): Promise<string> {
  const saved = await saveImage(await svgToPng(svg), { alt, db });
  return saved.id;
}

/** Tiny deterministic hash → stable pseudo-random stock levels across reruns. */
export function stableNumber(seed: string, max: number): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % max;
}
