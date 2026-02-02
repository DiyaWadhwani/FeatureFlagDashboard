/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { PrismaClient, FeatureFlagTier } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const flags = [
    { name: 'dark_mode', enabled: true, tier: FeatureFlagTier.SAFE },
    {
      name: 'discounted_checkout',
      enabled: false,
      tier: FeatureFlagTier.CRITICAL,
    },
    {
      name: 'audit_log_visibility',
      enabled: true,
      tier: FeatureFlagTier.SENSITIVE,
    },
    {
      name: 'experimental_cache',
      enabled: false,
      tier: FeatureFlagTier.SENSITIVE,
    },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { name: flag.name },
      update: {
        enabled: flag.enabled,
        tier: flag.tier,
      },
      create: flag,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
