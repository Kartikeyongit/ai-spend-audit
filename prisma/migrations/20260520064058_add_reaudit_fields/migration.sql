-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "pricingSnapshot" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';
