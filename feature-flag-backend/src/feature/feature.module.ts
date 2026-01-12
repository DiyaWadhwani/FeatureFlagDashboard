import { Module } from '@nestjs/common';
import { FeatureResolver } from './feature.resolver';
import { FeatureService } from './feature.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FeatureResolver, FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
