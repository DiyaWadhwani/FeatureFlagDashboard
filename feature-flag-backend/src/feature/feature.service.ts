import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlag } from '@prisma/client';

@Injectable()
export class FeatureService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.featureFlag.update({
      where: { id },
      data: { enabled: !existing.enabled },
    });
  }

  async isEnabled(name: string): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { name },
    });
    return flag ? flag.enabled : false;
  }
}
