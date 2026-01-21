import { useQuery } from "@apollo/client/react";
import { GET_FEATURE_FLAGS_FOR_CONFIG } from "@/graphql/featureFlags";
import type { GetFeatureFlagsConfigData } from "@/types/featureFlags";

export type AppConfig = Record<string, boolean>;

export function useConfig() {
  const { data, loading, error } = useQuery<GetFeatureFlagsConfigData>(
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
