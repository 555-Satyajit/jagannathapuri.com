-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "price_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;
