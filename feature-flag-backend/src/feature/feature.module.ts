import { Module } from '@nestjs/common';
import { FeatureResolver } from './feature.resolver';
import { FeatureService } from './feature.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AuditModule, AiModule],
  providers: [FeatureResolver, FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
