import { Module } from '@nestjs/common';
import { ThemeController } from './theme.controller';
import { FeatureModule } from '../feature/feature.module';

@Module({
  imports: [FeatureModule],
  controllers: [ThemeController],
})
export class ThemeModule {}
