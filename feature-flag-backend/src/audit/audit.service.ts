import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlagAudit } from '@prisma/client';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AuditService {
  private summaryCache: { text: string; cachedAt: number } | null = null;
  private readonly CACHE_TTL = 60_000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

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

  async getAuditLogs(): Promise<FeatureFlagAudit[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return await this.prisma.featureFlagAudit.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getAuditSummary(forceRefresh = false): Promise<string> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.summaryCache &&
      now - this.summaryCache.cachedAt < this.CACHE_TTL
    ) {
      return this.summaryCache.text;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const logs: FeatureFlagAudit[] = await this.prisma.featureFlagAudit.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    const text = await this.ai.generateAuditSummary(logs);
    this.summaryCache = { text, cachedAt: now };
    return text;
  }
}
