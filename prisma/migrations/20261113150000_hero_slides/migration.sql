-- CreateEnum
CREATE TYPE "HeroMode" AS ENUM ('SLIDER', 'CAMPAIGN');

-- AlterTable
ALTER TABLE "settings" ADD COLUMN "hero_mode" "HeroMode" NOT NULL DEFAULT 'SLIDER';

-- CreateTable
CREATE TABLE "hero_slides" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "media_id" TEXT NOT NULL,
    "product_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hero_slides_is_active_position_idx" ON "hero_slides"("is_active", "position");

-- CreateIndex
CREATE INDEX "hero_slides_media_id_idx" ON "hero_slides"("media_id");

-- CreateIndex
CREATE INDEX "hero_slides_product_id_idx" ON "hero_slides"("product_id");

-- AddForeignKey
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
