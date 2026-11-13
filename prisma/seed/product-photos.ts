import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const PHOTO_ROOT = path.resolve(process.cwd(), "data/product-photos");
const IMAGE_FILE = /\.(jpe?g|png|webp)$/i;

export type SeedPhoto = { file: string; bytes: Buffer };

/**
 * Reads one product's photos from data/product-photos/<folder>, in file-name
 * order (01.jpg is the cover). Throws when the folder is missing or empty so
 * a typo never seeds a product without images.
 */
export async function readProductPhotos(folder: string): Promise<SeedPhoto[]> {
  const dir = path.join(PHOTO_ROOT, folder);
  const files = (await readdir(dir)).filter((name) => IMAGE_FILE.test(name)).sort();
  if (files.length === 0) throw new Error(`No photos in ${dir}`);
  return Promise.all(files.map(async (file) => ({ file, bytes: await readFile(path.join(dir, file)) })));
}
