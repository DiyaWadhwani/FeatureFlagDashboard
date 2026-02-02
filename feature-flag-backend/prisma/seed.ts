/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { PrismaClient, FeatureFlagTier } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const flags = [
    {
      name: 'audit_log_visibility',
      tier: FeatureFlagTier.CRITICAL,
      enabled: true,
    },
    {
      name: 'discounted_checkout',
      tier: FeatureFlagTier.SENSITIVE,
      enabled: false,
    },
    {
      name: 'experimental_cache',
      tier: FeatureFlagTier.SENSITIVE,
      enabled: false,
    },
    {
      name: 'dark_mode',
      tier: FeatureFlagTier.SAFE,
      enabled: false,
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
