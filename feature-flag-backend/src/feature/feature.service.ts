import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlag } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FeatureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return this.prisma.featureFlag.findMany({ orderBy: { name: 'asc' } });
  }

  async toggleFeatureFlag(id: string): Promise<FeatureFlag> {
    const existing = await this.prisma.featureFlag.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Feature flag not found');
    }

    const updated = await this.prisma.featureFlag.update({
      where: { id },
      data: { enabled: !existing.enabled },
    });

    await this.audit.logFlagToggle({
      flagName: existing.name,
      oldValue: existing.enabled,
      newValue: updated.enabled,
      source: 'dashboard',
    });

    return updated;
  }

  async isEnabled(flagName: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { name: flagName },
    });
    return flag?.enabled ?? false;
  }
}
