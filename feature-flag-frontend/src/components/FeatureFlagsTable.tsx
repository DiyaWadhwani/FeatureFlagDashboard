import { useMutation, useQuery } from "@apollo/client/react";
import { TierBadge } from "./TierBadge";
import {
  Tooltip,
  TooltipContent,
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
import { CAN_TOGGLE_TIER, type ActorRole, FLAG_TIERS } from "@/constants";

type Props = {
  onCountChange: (count: number) => void;
};

const FLAG_INFO: Record<
  string,
  { severity?: string; description: string; impact: string }
> = {
  dark_mode: {
    severity: FLAG_TIERS.SAFE,
    description: "Enables dark theme styling across the console UI.",
    impact: "Cosmetic only. No effect on data, pricing, or system behavior.",
  },
  audit_log_visibility: {
    severity: FLAG_TIERS.CRITICAL,
    description: "Controls access to system audit logs.",
    impact: "Restricted to administrators to preserve audit integrity.",
  },
  discounted_checkout: {
    severity: FLAG_TIERS.SENSITIVE,
    description: "Enables discounted pricing logic in the checkout flow.",
    impact:
      "Business-impacting. Misuse can change totals and affect revenue; rollback is immediate.",
  },
  experimental_cache: {
    severity: FLAG_TIERS.SENSITIVE,
    description: "Caches the computed feature configuration for faster reads.",
    impact:
      "Operational risk. Improves performance but may briefly serve stale configuration during rollouts/rollbacks.",
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

  const actorRole = (localStorage.getItem("actorRole") ??
    "DEVELOPER") as ActorRole;

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
          {data!.featureFlags.map((flag) => {
            const canToggle = CAN_TOGGLE_TIER[actorRole].has(flag.tier);
            return (
              <TableRow key={flag.id} className="hover:bg-muted/50">
                <TableCell className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-sm text-foreground">
                    {flag.name}

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>

                      <TooltipContent className="max-w-xs">
                        {FLAG_INFO[flag.name]?.severity && (
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {FLAG_INFO[flag.name]?.severity} flag
                          </p>
                        )}
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
                  </div>

                  <TierBadge tier={flag.tier} />
                </TableCell>

                <TableCell>
                  <StatusBadge enabled={flag.enabled} />
                </TableCell>

                <TableCell className="text-right">
                  {!canToggle && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Requires admin privileges
                    </p>
                  )}
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={() => handleToggle(flag.id)}
                    disabled={!canToggle || toggling}
                    aria-label={`Toggle ${flag.name}`}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
