-- CreateTable
CREATE TABLE "FeatureFlagAudit" (
    "id" TEXT NOT NULL,
    "flagName" TEXT NOT NULL,
    "oldValue" BOOLEAN NOT NULL,
    "newValue" BOOLEAN NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureFlagAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeatureFlagAudit_flagName_idx" ON "FeatureFlagAudit"("flagName");
