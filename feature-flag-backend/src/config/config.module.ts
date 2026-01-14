import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { FeatureModule } from '../feature/feature.module';

@Module({
  imports: [FeatureModule],
  controllers: [ConfigController],
})
export class ConfigModule {}
