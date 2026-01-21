import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

export type AppConfig = Record<string, boolean>;

type FeatureFlag = {
  name: string;
  enabled: boolean;
};

type GetFeatureFlagsData = {
  featureFlags: FeatureFlag[];
};

const GET_FEATURE_FLAGS_FOR_CONFIG = gql`
  query GetFeatureFlagsForConfig {
    featureFlags {
      name
      enabled
    }
  }
`;

export function useConfig() {
  const { data, loading, error } = useQuery<GetFeatureFlagsData>(
    GET_FEATURE_FLAGS_FOR_CONFIG,
    {
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );

  const config: AppConfig | null = data
    ? Object.fromEntries(
        data.featureFlags.map((flag) => [flag.name, flag.enabled]),
      )
    : null;

  return { config, loading, error };
}
