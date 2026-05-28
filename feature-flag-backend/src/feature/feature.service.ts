import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FEATURE_FLAGS } from '../constants';
import { FeatureFlag } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { AiService } from '../ai/ai.service';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class FeatureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly ai: AiService,
    private readonly kafka: KafkaService,
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

    const source =
      existing.name === FEATURE_FLAGS.EXPERIMENTAL_CACHE
        ? 'infra-dashboard'
        : 'dashboard';

    await this.audit.logFlagToggle({
      flagName: existing.name,
      oldValue: existing.enabled,
      newValue: updated.enabled,
      source,
    });

    // fire-and-forget — does not block the toggle response
    this.kafka.publishFlagToggled({
      flagName: existing.name,
      oldValue: existing.enabled,
      newValue: updated.enabled,
      tier: existing.tier,
      source,
      timestamp: new Date().toISOString(),
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

  async isEnabled(flagName: string, clientId?: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { name: flagName },
    });
    if (!flag?.enabled) return false;
    if (!clientId) return true;
    const bucket = this.hashClientId(clientId) % 100;
    return bucket < flag.rolloutPercentage;
  }

  async updateRolloutPercentage(
    id: string,
    percentage: number,
  ): Promise<FeatureFlag> {
    const existing = await this.prisma.featureFlag.findUnique({ where: { id } });
    if (!existing) throw new Error('Feature flag not found');

    const updated = await this.prisma.featureFlag.update({
      where: { id },
      data: { rolloutPercentage: percentage },
    });

    await this.audit.logFlagToggle({
      flagName: existing.name,
      oldValue: existing.enabled,
      newValue: updated.enabled,
      source: 'dashboard',
      rolloutPercentage: percentage,
    });

    return updated;
  }

  private hashClientId(clientId: string): number {
    let hash = 5381;
    for (let i = 0; i < clientId.length; i++) {
      hash = ((hash << 5) + hash + clientId.charCodeAt(i)) >>> 0;
    }
    return hash;
  }
}
