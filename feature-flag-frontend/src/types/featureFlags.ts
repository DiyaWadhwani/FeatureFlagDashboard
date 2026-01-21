export interface FeatureFlagBase {
  name: string;
  enabled: boolean;
}

export interface FeatureFlag extends FeatureFlagBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type ToggleFeatureFlagVars = {
  id: string;
};

export type GetFeatureFlagsData = {
  featureFlags: FeatureFlag[];
};

export type GetFeatureFlagsConfigData = {
  featureFlags: FeatureFlagBase[];
};
