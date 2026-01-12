import { Controller, Get } from '@nestjs/common';
import { FeatureService } from '../feature/feature.service';

@Controller('theme')
export class ThemeController {
  constructor(private readonly flags: FeatureService) {}

  @Get('config')
  async getThemeConfig() {
    const darkModeEnabled = await this.flags.isEnabled('dark_mode_v2');
    return { darkMode: darkModeEnabled };
  }
}
