import { Controller, Get } from '@nestjs/common';
import { FeatureService } from '../feature/feature.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  async getConfig() {
    const flags = await this.featureService.getAllFeatureFlags();

    return flags.reduce<Record<string, boolean>>((acc, flag) => {
      acc[flag.name] = flag.enabled;
      return acc;
    }, {});
  }
}
