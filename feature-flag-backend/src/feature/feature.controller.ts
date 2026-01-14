import { Controller, Get } from '@nestjs/common';
import { FeatureService } from './feature.service';

@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get('config')
  async getConfig() {
    const flags = await this.featureService.getAllFeatureFlags();

    return flags.reduce<Record<string, boolean>>((acc, flag) => {
      acc[flag.name] = flag.enabled;
      return acc;
    }, {});
  }
}
