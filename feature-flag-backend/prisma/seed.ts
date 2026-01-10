/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.featureFlag.createMany({
    data: [
      { name: 'dark_mode_v2', enabled: true },
      { name: 'new_checkout_flow', enabled: false },
      { name: 'beta_analytics', enabled: true },
      { name: 'experimental_cache', enabled: false },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
