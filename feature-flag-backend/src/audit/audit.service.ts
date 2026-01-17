import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FeatureFlagAudit } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async logFlagToggle(params: {
    flagName: string;
    oldValue: boolean;
    newValue: boolean;
    source: string;
  }): Promise<FeatureFlagAudit> {
    console.log('🟣 AUDIT SERVICE CALLED');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const entry: FeatureFlagAudit = await this.prisma.featureFlagAudit.create({
      data: params,
    });
    return entry;
  }
}
