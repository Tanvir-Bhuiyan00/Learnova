-- DropIndex
DROP INDEX "payments_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "invoiceUrl" VARCHAR(500),
ADD COLUMN     "paymentGatewayData" JSONB,
ADD COLUMN     "stripeEventId" TEXT,
ALTER COLUMN "stripePaymentIntentId" DROP NOT NULL;
