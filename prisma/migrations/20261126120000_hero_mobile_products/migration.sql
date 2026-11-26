-- CreateTable
CREATE TABLE "hero_mobile_products" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "product_id" TEXT NOT NULL,
    "media_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_mobile_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hero_mobile_products_product_id_key" ON "hero_mobile_products"("product_id");

-- CreateIndex
CREATE INDEX "hero_mobile_products_position_idx" ON "hero_mobile_products"("position");

-- CreateIndex
CREATE INDEX "hero_mobile_products_media_id_idx" ON "hero_mobile_products"("media_id");

-- AddForeignKey
ALTER TABLE "hero_mobile_products" ADD CONSTRAINT "hero_mobile_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_mobile_products" ADD CONSTRAINT "hero_mobile_products_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
