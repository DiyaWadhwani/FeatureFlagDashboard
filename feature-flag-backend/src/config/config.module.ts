import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { FeatureModule } from '../feature/feature.module';

@Module({
  imports: [FeatureModule],
  controllers: [ConfigController],
  providers: [ConfigService],
})
export class ConfigModule {}
