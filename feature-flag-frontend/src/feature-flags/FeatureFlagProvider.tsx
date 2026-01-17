import { useEffect, useState } from "react";
import { FeatureFlagContext } from "./FeatureFlagContext";
import type { FeatureFlags } from "./types";

type Props = {
  children: React.ReactNode;
};

export function FeatureFlagProvider({ children }: Props) {
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const res = await fetch("http://localhost:3000/config");
        const data = await res.json();
        setFlags(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch feature flags:", error);
      }
    };

    fetchFlags();

    const interval = setInterval(fetchFlags, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);
  if (loading) {
    return null;
  }

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  );
}
