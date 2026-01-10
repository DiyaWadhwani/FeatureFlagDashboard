import { Module } from '@nestjs/common';
import { FeatureResolver } from './feature.resolver';

@Module({
  providers: [FeatureResolver],
})
export class FeatureModule {}
