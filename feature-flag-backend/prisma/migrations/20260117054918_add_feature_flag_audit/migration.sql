/*
  Warnings:

  - You are about to drop the column `createdAt` on the `FeatureFlagAudit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FeatureFlagAudit" DROP COLUMN "createdAt",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "FeatureFlagAudit_updatedAt_idx" ON "FeatureFlagAudit"("updatedAt");
