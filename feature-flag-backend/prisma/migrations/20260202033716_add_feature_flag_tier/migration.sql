-- CreateEnum
CREATE TYPE "FeatureFlagTier" AS ENUM ('SAFE', 'SENSITIVE', 'CRITICAL');

-- AlterTable
ALTER TABLE "FeatureFlag" ADD COLUMN     "tier" "FeatureFlagTier" NOT NULL DEFAULT 'SAFE';
