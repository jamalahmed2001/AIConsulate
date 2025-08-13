/*
  Warnings:

  - A unique constraint covering the columns `[sourceRef]` on the table `CreditLedger` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."CreditLedger" ADD COLUMN     "balanceAfter" INTEGER,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "source" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CreditLedger_sourceRef_key" ON "public"."CreditLedger"("sourceRef");
