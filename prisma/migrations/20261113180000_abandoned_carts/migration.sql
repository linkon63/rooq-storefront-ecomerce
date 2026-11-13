-- CreateEnum
CREATE TYPE "AbandonedCartStatus" AS ENUM ('OPEN', 'RECOVERED');

-- CreateTable
CREATE TABLE "abandoned_carts" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "city" TEXT,
    "items" JSONB NOT NULL,
    "item_count" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "status" "AbandonedCartStatus" NOT NULL DEFAULT 'OPEN',
    "order_number" TEXT,
    "recovered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abandoned_carts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "abandoned_carts_token_key" ON "abandoned_carts"("token");

-- CreateIndex
CREATE INDEX "abandoned_carts_phone_idx" ON "abandoned_carts"("phone");

-- CreateIndex
CREATE INDEX "abandoned_carts_status_updated_at_idx" ON "abandoned_carts"("status", "updated_at");
