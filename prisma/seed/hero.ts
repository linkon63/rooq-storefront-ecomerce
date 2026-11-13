import { saveImage } from "../../lib/server/media/save-image";
import type { SeedDb } from "./db";
import { readDataPhotos } from "./product-photos";

/** data/hero-slider/white, in file order → the product each look shows (null: no card). */
const SLIDE_PRODUCTS: (string | null)[] = [
  "teal-block-print-saree",
  "lavender-embroidered-border-saree",
  "red-ethnic-print-saree",
  "light-pink-floral-saree",
  "mustard-block-print-saree",
  "bright-pink-zari-border-saree",
  null, // two looks in one photo: no single product
];

/**
 * First-run hero slides. Once any slide exists the admin owns them
 * (Settings → Hero Slider), so a rerun changes nothing.
 */
export async function seedHeroSlides(db: SeedDb, products: Map<string, string>): Promise<number> {
  if ((await db.heroSlide.count()) > 0) return 0;
  const photos = await readDataPhotos("hero-slider/white");
  for (const [position, photo] of photos.entries()) {
    const slug = SLIDE_PRODUCTS[position] ?? null;
    const media = await saveImage(photo.bytes, { alt: `Look ${position + 1}`, db });
    await db.heroSlide.create({ data: { mediaId: media.id, position, productId: slug ? (products.get(slug) ?? null) : null } });
  }
  return photos.length;
}
