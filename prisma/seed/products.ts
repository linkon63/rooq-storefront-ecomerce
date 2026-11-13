import type { SeedDb } from "./db";
import { stableNumber, storeSvg } from "./db";
import { saveImage } from "../../lib/server/media/save-image";
import { garmentSvg } from "./placeholder-art";
import type { Masters } from "./masters";
import type { CategoryIds } from "./categories";
import { PRODUCTS, type ProductSeed } from "./product-data";
import { readProductPhotos } from "./product-photos";

type Refs = {
  masters: Masters;
  categories: CategoryIds;
  brands: Map<string, string>;
  tags: Map<string, string>;
  attributeValues: Map<string, string>;
  pieceUnitId: string;
  pairUnitId: string;
  supplierId: string;
};

const DAY = 24 * 60 * 60 * 1000;

/** "alpha-m" → "M", "waist-32" → "32", "eu-40" → "40", "one-size" → "OS" */
function sizeCode(slug: string): string {
  if (slug === "one-size") return "OS";
  return slug.split("-").pop()!.toUpperCase();
}

function stockFor(sku: string): number {
  const bucket = stableNumber(`${sku}:bucket`, 10);
  if (bucket === 0) return 0; // sold out size
  if (bucket === 1) return 1 + stableNumber(sku, 3); // "Only 2 left"
  return 8 + stableNumber(sku, 32);
}

/** Real photos: every file in the product folder, cover first, all tied to the product's colour. */
async function seedPhotoGallery(db: SeedDb, productId: string, seed: ProductSeed, folder: string, refs: Refs) {
  const color = refs.masters.colors.get(seed.colors[0])!;
  const photos = await readProductPhotos(folder);
  for (const [position, photo] of photos.entries()) {
    const saved = await saveImage(photo.bytes, { alt: `${seed.name}, photo ${position + 1}`, db });
    await db.productMedia.upsert({
      where: { productId_mediaId: { productId, mediaId: saved.id } },
      update: { position, colorId: color.id, isPrimary: position === 0 },
      create: { productId, mediaId: saved.id, position, colorId: color.id, isPrimary: position === 0 },
    });
  }
}

async function seedGallery(db: SeedDb, productId: string, seed: ProductSeed, refs: Refs) {
  if (seed.photos) return seedPhotoGallery(db, productId, seed, seed.photos, refs);
  if (!seed.kind) throw new Error(`${seed.slug} needs either photos or a kind`);
  let position = 0;
  for (const [colorIndex, colorSlug] of seed.colors.entries()) {
    const color = refs.masters.colors.get(colorSlug)!;
    const views: (0 | 1 | 2)[] = colorIndex === 0 ? [0, 1, 2] : [0, 1];
    for (const view of views) {
      const alt = `${seed.name} in ${color.name}${view === 1 ? " — detail" : view === 2 ? " — flat lay" : ""}`;
      const mediaId = await storeSvg(db, garmentSvg({ hex: color.hex, kind: seed.kind, view }), alt);
      await db.productMedia.upsert({
        where: { productId_mediaId: { productId, mediaId } },
        update: { position, colorId: color.id, isPrimary: position === 0 },
        create: { productId, mediaId, position, colorId: color.id, isPrimary: position === 0 },
      });
      position += 1;
    }
  }
}

async function seedVariants(db: SeedDb, productId: string, seed: ProductSeed, refs: Refs): Promise<number> {
  let created = 0;
  const defaultSize = seed.sizes[Math.floor(seed.sizes.length / 2)];
  for (const [colorIndex, colorSlug] of seed.colors.entries()) {
    const color = refs.masters.colors.get(colorSlug)!;
    for (const [sizeIndex, sizeSlug] of seed.sizes.entries()) {
      const size = refs.masters.sizes.get(sizeSlug)!;
      const sku = `${seed.styleCode}-${color.code}-${sizeCode(sizeSlug)}`;
      const exists = await db.productVariant.findUnique({ where: { sku }, select: { id: true } });
      const stock = seed.stock ?? stockFor(sku);
      const variant = await db.productVariant.upsert({
        where: { sku },
        update: { colorId: color.id, sizeId: size.id, position: colorIndex * 100 + sizeIndex },
        create: {
          sku,
          productId,
          colorId: color.id,
          sizeId: size.id,
          stock,
          lowStockThreshold: 3,
          position: colorIndex * 100 + sizeIndex,
          isDefault: colorIndex === 0 && sizeSlug === defaultSize,
          barcode: `200${String(stableNumber(sku, 1_000_000_000)).padStart(10, "0")}`,
        },
        select: { id: true },
      });
      if (!exists) {
        created += 1;
        if (stock > 0) {
          await db.stockMovement.create({
            data: { variantId: variant.id, type: "INITIAL", quantity: stock, stockAfter: stock, reason: "Seed opening stock" },
          });
        }
      }
    }
  }
  return created;
}

export async function seedProducts(db: SeedDb, refs: Refs): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  const now = Date.now();
  for (const [index, seed] of PRODUCTS.entries()) {
    const isNew = seed.tags?.includes("new-arrival") ?? false;
    const fields = {
      name: seed.name,
      styleCode: seed.styleCode,
      shortDescription: seed.short,
      description: `${seed.short} ${seed.material}, ${seed.composition.toLowerCase()}. Designed by Rooq for everyday wear.`,
      status: "active" as const,
      isFeatured: seed.featured ?? false,
      price: seed.price,
      compareAtPrice: seed.compareAtPrice ?? null,
      costPrice: Math.round(seed.price * 0.45),
      department: seed.department,
      material: seed.material,
      composition: seed.composition,
      careInstructions: seed.care,
      fit: seed.fit ?? null,
      season: seed.season,
      occasions: seed.occasions,
      pattern: seed.pattern,
      modelInfo: seed.modelInfo ?? null,
      features: seed.features,
      metaTitle: `${seed.name} | Rooq`,
      metaDescription: seed.short,
      brandId: refs.brands.get(seed.brand)!,
      categoryId: refs.categories.get(seed.category)!,
      unitId: seed.unit === "pair" ? refs.pairUnitId : refs.pieceUnitId,
      supplierId: refs.supplierId,
      soldCount: 20 + stableNumber(seed.slug, 400),
      tags: { set: (seed.tags ?? []).map((slug) => ({ id: refs.tags.get(slug)! })) },
    };
    const product = await db.product.upsert({
      where: { slug: seed.slug },
      update: fields,
      create: {
        ...fields,
        slug: seed.slug,
        tags: { connect: (seed.tags ?? []).map((slug) => ({ id: refs.tags.get(slug)! })) },
        publishedAt: new Date(now - (isNew ? index : 60 + index) * DAY),
      },
      select: { id: true },
    });
    ids.set(seed.slug, product.id);

    for (const key of seed.attributes ?? []) {
      const attributeValueId = refs.attributeValues.get(key);
      if (!attributeValueId) continue;
      await db.productAttributeValue.upsert({
        where: { productId_attributeValueId: { productId: product.id, attributeValueId } },
        update: {},
        create: { productId: product.id, attributeValueId },
      });
    }

    await seedGallery(db, product.id, seed, refs);
    await seedVariants(db, product.id, seed, refs);
  }
  return ids;
}
