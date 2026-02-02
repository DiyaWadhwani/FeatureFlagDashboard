import { cn } from "@/lib/utils";
import type { FeatureFlagTier } from "@/types/featureFlags";

const tierStyles: Record<FeatureFlagTier, string> = {
  SAFE: "bg-slate-100 text-slate-700",
  SENSITIVE: "bg-amber-100 text-amber-800",
  CRITICAL: "bg-red-100 text-red-700",
};

export function TierBadge({ tier }: { tier: FeatureFlagTier }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide",
        tierStyles[tier],
      )}
    >
      {tier}
    </span>
  );
}
