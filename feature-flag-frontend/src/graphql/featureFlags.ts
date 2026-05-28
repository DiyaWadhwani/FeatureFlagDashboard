import { gql } from "@apollo/client";

export const GET_FEATURE_FLAGS = gql`
  query GetFeatureFlags {
    featureFlags {
      id
      name
      enabled
      tier
      rolloutPercentage
      createdAt
      updatedAt
    }
  }
`;

export const GET_FEATURE_FLAGS_FOR_CONFIG = gql`
  query GetFeatureFlagsForConfig {
    featureFlags {
      name
      enabled
    }
  }
`;

export const TOGGLE_FEATURE_FLAG = gql`
  mutation ToggleFeatureFlag($id: ID!) {
    toggleFeatureFlag(id: $id) {
      id
      enabled
      riskNote
    }
  }
`;

export const UPDATE_ROLLOUT_PERCENTAGE = gql`
  mutation UpdateRolloutPercentage($id: ID!, $percentage: Int!) {
    updateRolloutPercentage(id: $id, percentage: $percentage) {
      id
      rolloutPercentage
    }
  }
`;
