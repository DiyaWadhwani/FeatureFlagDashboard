import { Injectable } from '@nestjs/common';
import { FeatureService } from '../feature/feature.service';
import { FEATURE_FLAGS } from '../constants';

@Injectable()
export class ConfigService {
  private cache: Record<string, boolean> | null = null;
  private cacheTimestamp = 0;

  constructor(private readonly flags: FeatureService) {}

  async getConfig() {
    const cacheEnabled = await this.flags.isEnabled(
      FEATURE_FLAGS.EXPERIMENTAL_CACHE,
    );
    const now = Date.now();

    if (cacheEnabled && this.cache && now - this.cacheTimestamp < 10_000) {
      console.log('🟢 Returning CONFIG from CACHE');
      return this.cache;
    }

    console.log('🔵 Fetching CONFIG from DATABASE');

    try {
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
    } catch (error) {
      if (cacheEnabled && this.cache) {
        console.warn('🟠 DB fetch failed — serving STALE cached config');
        return this.cache;
      }

      throw error;
    }
  }
}
