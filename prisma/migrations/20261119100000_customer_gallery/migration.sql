-- CreateEnum
CREATE TYPE "GallerySource" AS ENUM ('WEBSITE', 'FACEBOOK');

-- CreateTable
CREATE TABLE "customer_gallery_entries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "rating" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "source" "GallerySource" NOT NULL DEFAULT 'WEBSITE',
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "contact_phone" TEXT,
    "consent_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_gallery_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_gallery_images" (
    "position" INTEGER NOT NULL DEFAULT 0,
    "entry_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_gallery_images_pkey" PRIMARY KEY ("entry_id","media_id")
);

-- CreateIndex
CREATE INDEX "customer_gallery_entries_status_source_created_at_idx" ON "customer_gallery_entries"("status", "source", "created_at");

-- CreateIndex
CREATE INDEX "customer_gallery_images_media_id_idx" ON "customer_gallery_images"("media_id");

-- AddForeignKey
ALTER TABLE "customer_gallery_images" ADD CONSTRAINT "customer_gallery_images_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "customer_gallery_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_gallery_images" ADD CONSTRAINT "customer_gallery_images_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

