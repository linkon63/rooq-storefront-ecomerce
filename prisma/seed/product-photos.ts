import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const DATA_ROOT = path.resolve(process.cwd(), "data");
const IMAGE_FILE = /\.(jpe?g|png|webp)$/i;

export type SeedPhoto = { file: string; bytes: Buffer };

/**
 * Reads every image in data/<dir>, in file-name order (01.jpg first). Throws
 * when the folder is missing or empty so a typo never seeds without images.
 */
export async function readDataPhotos(dir: string): Promise<SeedPhoto[]> {
  const full = path.join(DATA_ROOT, dir);
  const files = (await readdir(full)).filter((name) => IMAGE_FILE.test(name)).sort();
  if (files.length === 0) throw new Error(`No photos in ${full}`);
  return Promise.all(files.map(async (file) => ({ file, bytes: await readFile(path.join(full, file)) })));
}

/** One product's photos from data/product-photos/<folder> (01.jpg is the cover). */
export function readProductPhotos(folder: string): Promise<SeedPhoto[]> {
  return readDataPhotos(path.join("product-photos", folder));
}
