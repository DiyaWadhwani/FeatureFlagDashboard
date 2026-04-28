import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FEATURE_FLAGS } from '../constants';
import { FeatureFlag } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class FeatureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly ai: AiService,
  ) {}

  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    return this.prisma.featureFlag.findMany({ orderBy: { name: 'asc' } });
  }

  async toggleFeatureFlag(
    id: string,
  ): Promise<FeatureFlag & { riskNote?: string }> {
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
      source:
        existing.name === FEATURE_FLAGS.EXPERIMENTAL_CACHE
          ? 'infra-dashboard'
          : 'dashboard',
    });

    const recentHistory = await this.prisma.featureFlagAudit.findMany({
      where: { flagName: existing.name },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    let riskNote: string | undefined;
    try {
      riskNote = await this.ai.assessToggleRisk({
        flagName: existing.name,
        tier: existing.tier,
        oldValue: existing.enabled,
        newValue: updated.enabled,
        recentHistory,
      });
    } catch (err) {
      console.error('AI risk assessment failed:', err);
    }

    return { ...updated, riskNote };
  }

  async isEnabled(flagName: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { name: flagName },
    });
    return flag?.enabled ?? false;
  }
}
