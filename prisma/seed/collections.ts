import type { CollectionType } from "../../lib/generated/prisma/enums";
import type { SeedDb } from "./db";
import { storeSvg } from "./db";
import { toneSvg } from "./placeholder-art";

type CollectionSeed = {
  slug: string;
  name: string;
  type: CollectionType;
  description: string;
  tone: [string, string];
  products: string[];
  looks?: { title: string; description: string; tone: [string, string]; products: string[] }[];
};

const COLLECTIONS: CollectionSeed[] = [
  {
    slug: "saree-edit",
    name: "The Saree Edit",
    type: "COLLECTION",
    description: "Handloom cottons and zari borders in colours made for the season.",
    tone: ["#B0125B", "#F2B8C6"],
    products: [
      "off-white-red-border-saree",
      "mustard-block-print-saree",
      "bright-pink-zari-border-saree",
      "magenta-zari-flower-saree",
      "teal-block-print-saree",
      "red-ethnic-print-saree",
      "lavender-embroidered-border-saree",
      "light-pink-floral-saree",
    ],
  },
];

export async function seedCollections(db: SeedDb, products: Map<string, string>): Promise<number> {
  for (const [position, seed] of COLLECTIONS.entries()) {
    const coverMediaId = await storeSvg(db, toneSvg(seed.tone[0], seed.tone[1]), `${seed.name} cover`);
    const collection = await db.collection.upsert({
      where: { slug: seed.slug },
      update: { name: seed.name, type: seed.type, description: seed.description, coverMediaId, position, isFeatured: true },
      create: { slug: seed.slug, name: seed.name, type: seed.type, description: seed.description, coverMediaId, position, isFeatured: true },
      select: { id: true },
    });

    for (const [index, slug] of seed.products.entries()) {
      const productId = products.get(slug);
      if (!productId) continue;
      await db.collectionProduct.upsert({
        where: { collectionId_productId: { collectionId: collection.id, productId } },
        update: { position: index },
        create: { collectionId: collection.id, productId, position: index },
      });
    }

    // Looks have no natural unique key — rebuild them so reruns stay identical.
    if (seed.looks) {
      await db.collectionLook.deleteMany({ where: { collectionId: collection.id } });
      for (const [index, look] of seed.looks.entries()) {
        const mediaId = await storeSvg(db, toneSvg(look.tone[0], look.tone[1], 1200, 1500), look.title);
        await db.collectionLook.create({
          data: {
            collectionId: collection.id,
            title: look.title,
            description: look.description,
            position: index,
            mediaId,
            items: {
              create: look.products
                .map((slug, itemIndex) => ({ productId: products.get(slug), position: itemIndex }))
                .filter((item): item is { productId: string; position: number } => !!item.productId),
            },
          },
        });
      }
    }
  }
  return COLLECTIONS.length;
}
