import { Injectable } from '@nestjs/common';
import { FeatureService } from '../feature/feature.service';

@Injectable()
export class ConfigService {
  private cache: Record<string, boolean> | null = null;
  private cacheTimestamp = 0;

  constructor(private readonly flags: FeatureService) {}

  async getConfig() {
    const cacheEnabled = await this.flags.isEnabled('experimental_cache');
    const now = Date.now();

    if (cacheEnabled && this.cache && now - this.cacheTimestamp < 10_000) {
      console.log('🟢 Returning CONFIG from CACHE');
      return this.cache;
    }

    console.log('🔵 Fetching CONFIG from DATABASE');

    const flags = await this.flags.getAllFeatureFlags();
    const config = flags.reduce<Record<string, boolean>>((acc, flag) => {
      acc[flag.name] = flag.enabled;
      return acc;
    }, {});

    if (cacheEnabled) {
      this.cache = config;
      this.cacheTimestamp = now;
    }

    return config;
  }
}
