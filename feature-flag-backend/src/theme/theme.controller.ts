import { Controller, Get } from '@nestjs/common';
import { FeatureService } from '../feature/feature.service';
import { FEATURE_FLAGS } from 'src/constants';

@Controller('theme')
export class ThemeController {
  constructor(private readonly flags: FeatureService) {}

  @Get('config')
  async getThemeConfig() {
    const darkModeEnabled = await this.flags.isEnabled(FEATURE_FLAGS.DARK_MODE);
    return { darkMode: darkModeEnabled };
  }
}
