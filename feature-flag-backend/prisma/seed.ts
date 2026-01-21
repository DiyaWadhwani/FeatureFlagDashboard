/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.featureFlag.createMany({
    data: [
      { name: 'dark_mode', enabled: true },
      { name: 'discounted_checkout', enabled: false },
      { name: 'audit_log_visibility', enabled: true },
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
