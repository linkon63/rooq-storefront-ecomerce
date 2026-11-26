/**
 * Publishes the customer feedback screenshots in data/review to the customer
 * gallery. Each one is cropped to the feedback itself, leaving out the phone
 * chrome and the customer's name and profile photo. Safe to rerun.
 *
 *   pnpm db:seed:reviews
 */
import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "../lib/server/prisma";
import { saveImage } from "../lib/server/media/save-image";

const FOLDER = path.resolve(process.cwd(), "data/review");
const NAME = "ROOQ customer";

type Review = { crop: { left: number; top: number; width: number; height: number }; feedback: string };

/** Keyed by the first part of the file name. Feedback is the customer's own words where they wrote any. */
const REVIEWS: Record<string, Review> = {
  "905708937": {
    crop: { left: 66, top: 145, width: 410, height: 690 },
    feedback:
      "এত সুন্দর একটা সারপ্রাইজ পাব ভাবিনি! আমার জন্মদিন উপলক্ষে এত সুন্দর করে লেখা চিরকুট আর সঙ্গে মিষ্টি একটা চকলেট, ছোট্ট এই ভালোবাসাটুকু সত্যিই মন ছুঁয়ে গেছে। আপনাদের সুন্দর ব্যবহার, যত্ন আর আন্তরিকতায় আমি মুগ্ধ! এত সুন্দরভাবে ভালোবাসা দেওয়ার জন্য অনেক অনেক ধন্যবাদ ROOQ।",
  },
  "905490283": {
    crop: { left: 0, top: 215, width: 552, height: 925 },
    feedback:
      "Absolutely in love with this saree! The material is sooo good, and the packaging is just as beautiful! Everything was perfectly packed with so much care. Such a lovely shopping experience! Highly recommended!",
  },
  "906381058": {
    crop: { left: 66, top: 355, width: 486, height: 590 },
    feedback: "Haee apuu onk pochondo hoiche thank youu",
  },
  "910767646": {
    crop: { left: 66, top: 310, width: 322, height: 645 },
    feedback: "ROOQ থেকে পাওয়া শাড়ি আর হাতে লেখা চিরকুটের ছবি পাঠিয়েছেন আমাদের একজন ক্রেতা।",
  },
};

async function main() {
  const files = await readdir(FOLDER);
  let added = 0;
  for (const [key, review] of Object.entries(REVIEWS)) {
    const file = files.find((name) => name.startsWith(key));
    if (!file) continue;
    const exists = await prisma.customerGalleryEntry.findFirst({ where: { feedback: review.feedback }, select: { id: true } });
    if (exists) continue;
    const cropped = await sharp(await readFile(path.join(FOLDER, file))).extract(review.crop).png().toBuffer();
    const media = await saveImage(cropped, { alt: "Customer feedback screenshot", db: prisma });
    await prisma.customerGalleryEntry.create({
      data: {
        name: NAME,
        rating: 5,
        feedback: review.feedback,
        source: "FACEBOOK",
        status: "APPROVED",
        consentAt: new Date(),
        images: { create: [{ mediaId: media.id, position: 0 }] },
      },
    });
    added += 1;
  }
  console.log(`✓ ${added} reviews added to the customer gallery`);
}

main()
  .catch((error: unknown) => {
    console.error("Review seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
