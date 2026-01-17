import { createContext, useContext } from "react";
import type { FeatureFlags } from "./types";

export const FeatureFlagContext = createContext<FeatureFlags | null>(null);

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagProvider"
    );
  }
  return context;   
}
