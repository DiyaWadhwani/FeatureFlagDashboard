export interface FeatureFlagBase {
  name: string;
  enabled: boolean;
}

export type FeatureFlagTier = "SAFE" | "SENSITIVE" | "CRITICAL";

export interface FeatureFlag extends FeatureFlagBase {
  id: string;
  tier: FeatureFlagTier;
  createdAt: string;
  updatedAt: string;
}

export type ToggleFeatureFlagVars = {
  id: string;
};

export type ToggleFeatureFlagResult = {
  toggleFeatureFlag: {
    id: string;
    enabled: boolean;
    riskNote?: string | null;
  };
};

export type GetFeatureFlagsData = {
  featureFlags: FeatureFlag[];
};

export type GetFeatureFlagsConfigData = {
  featureFlags: FeatureFlagBase[];
};
