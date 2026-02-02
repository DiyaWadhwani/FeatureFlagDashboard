import { useMutation, useQuery } from "@apollo/client/react";
import { TierBadge } from "./TierBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/StatusBadge";
import { useEffect } from "react";
import { GET_FEATURE_FLAGS, TOGGLE_FEATURE_FLAG } from "@/graphql/featureFlags";
import type { FeatureFlag, ToggleFeatureFlagVars } from "@/types/featureFlags";

type Props = {
  onCountChange: (count: number) => void;
};

const FLAG_INFO: Record<string, { description: string; impact: string }> = {
  dark_mode: {
    description: "Controls UI theme for end users.",
    impact: "Cosmetic only. No impact on data or revenue.",
  },
  audit_log_visibility: {
    description: "Emits analytics-style logs during checkout.",
    impact: "Improves observability and operational visibility.",
  },
  discounted_checkout: {
    description: "Applies discounted pricing logic at checkout.",
    impact: "Revenue-impacting. Incorrect toggles affect billing.",
  },
  experimental_cache: {
    description: "Caches feature configuration in memory.",
    impact:
      "Improves performance but may serve stale configuration during failures.",
  },
};

export function FeatureFlagsTable({ onCountChange }: Props) {
  const { data, loading, error } = useQuery<{ featureFlags: FeatureFlag[] }>(
    GET_FEATURE_FLAGS,
  );

  useEffect(() => {
    if (data?.featureFlags && onCountChange) {
      onCountChange(data.featureFlags.length);
    }
  }, [data, onCountChange]);

  const [toggleFeatureFlag, { loading: toggling }] = useMutation(
    TOGGLE_FEATURE_FLAG,
    {
      optimisticResponse: (vars: ToggleFeatureFlagVars) => ({
        toggleFeatureFlag: {
          __typename: "FeatureFlag",
          id: vars.id,
          enabled: !data?.featureFlags.find((flag) => flag.id === vars.id)
            ?.enabled,
        },
      }),
      refetchQueries: [{ query: GET_FEATURE_FLAGS }],
    },
  );

  const handleToggle = async (id: string) => {
    await toggleFeatureFlag({
      variables: { id },
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">Loading feature flags…</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-destructive">Failed to load feature flags</div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50%] text-muted-foreground font-medium">
              Feature Name
            </TableHead>
            <TableHead className="w-[25%] text-muted-foreground font-medium">
              Status
            </TableHead>
            <TableHead className="w-[25%] text-muted-foreground font-medium text-right">
              Toggle
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data!.featureFlags.map((flag) => (
            <TableRow key={flag.id} className="hover:bg-muted/50">
              <TableCell className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-sm text-foreground">
                  {flag.name}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>

                      <TooltipContent className="max-w-xs">
                        <div className="space-y-1 max-w-[220px]">
                          <p className="text-[11px] font-medium text-foreground">
                            {FLAG_INFO[flag.name]?.description}
                          </p>

                          <p className="text-[11px] text-muted-foreground">
                            <span className="font-medium">Impact:</span>{" "}
                            {FLAG_INFO[flag.name]?.impact}
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <TierBadge tier={flag.tier} />
              </TableCell>

              <TableCell>
                <StatusBadge enabled={flag.enabled} />
              </TableCell>

              <TableCell className="text-right">
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={() => handleToggle(flag.id)}
                  disabled={toggling}
                  aria-label={`Toggle ${flag.name}`}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
