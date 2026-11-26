-- CreateTable
CREATE TABLE "reels" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "product_id" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reel_blobs" (
    "reel_id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "reel_blobs_pkey" PRIMARY KEY ("reel_id")
);

-- CreateIndex
CREATE INDEX "reels_is_active_position_idx" ON "reels"("is_active", "position");

-- CreateIndex
CREATE INDEX "reels_product_id_idx" ON "reels"("product_id");

-- AddForeignKey
ALTER TABLE "reels" ADD CONSTRAINT "reels_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reel_blobs" ADD CONSTRAINT "reel_blobs_reel_id_fkey" FOREIGN KEY ("reel_id") REFERENCES "reels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
