import { useMutation, useQuery } from "@apollo/client/react";
import { TierBadge } from "./TierBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, X } from "lucide-react";
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
import { Fragment, useEffect, useRef, useState } from "react";
import {
  GET_FEATURE_FLAGS,
  TOGGLE_FEATURE_FLAG,
  UPDATE_ROLLOUT_PERCENTAGE,
} from "@/graphql/featureFlags";
import type {
  FeatureFlag,
  FeatureFlagTier,
  ToggleFeatureFlagVars,
  ToggleFeatureFlagResult,
  UpdateRolloutPercentageVars,
} from "@/types/featureFlags";
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

const RISK_NOTE_STYLES: Record<
  FeatureFlagTier,
  { container: string; text: string }
> = {
  SAFE: {
    container: "bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
  },
  SENSITIVE: {
    container: "bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  CRITICAL: {
    container: "bg-red-50 border border-red-200 dark:bg-red-950/30 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
  },
};

export function FeatureFlagsTable({ onCountChange }: Props) {
  const { data, loading, error } = useQuery<{ featureFlags: FeatureFlag[] }>(
    GET_FEATURE_FLAGS,
  );

  const [riskNotes, setRiskNotes] = useState<
    Record<string, { note: string; tier: FeatureFlagTier }>
  >({});

  const [pendingPercentages, setPendingPercentages] = useState<
    Record<string, number>
  >({});
  const timerRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (data?.featureFlags && onCountChange) {
      onCountChange(data.featureFlags.length);
    }
  }, [data, onCountChange]);

  const [toggleFeatureFlag, { loading: toggling }] = useMutation<
    ToggleFeatureFlagResult,
    ToggleFeatureFlagVars
  >(TOGGLE_FEATURE_FLAG, {
    optimisticResponse: (vars: ToggleFeatureFlagVars) => ({
      toggleFeatureFlag: {
        __typename: "FeatureFlag",
        id: vars.id,
        enabled: !data?.featureFlags.find((flag) => flag.id === vars.id)
          ?.enabled,
        riskNote: null,
      },
    }),
    refetchQueries: [{ query: GET_FEATURE_FLAGS }],
  });

  const [updateRolloutPercentage] = useMutation<
    { updateRolloutPercentage: { id: string; rolloutPercentage: number } },
    UpdateRolloutPercentageVars
  >(UPDATE_ROLLOUT_PERCENTAGE, {
    refetchQueries: [{ query: GET_FEATURE_FLAGS }],
  });

  const dismissNote = (id: string) => {
    setRiskNotes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleToggle = async (id: string, tier: FeatureFlagTier) => {
    const result = await toggleFeatureFlag({ variables: { id } });
    const note = result.data?.toggleFeatureFlag?.riskNote;
    if (note) {
      setRiskNotes((prev) => ({ ...prev, [id]: { note, tier } }));
    }
  };

  const handlePercentageChange = (id: string, percentage: number) => {
    setPendingPercentages((prev) => ({ ...prev, [id]: percentage }));
    clearTimeout(timerRefs.current[id]);
    timerRefs.current[id] = setTimeout(() => {
      void updateRolloutPercentage({ variables: { id, percentage } }).then(
        () => {
          setPendingPercentages((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        },
      );
    }, 500);
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
            const activeNote = riskNotes[flag.id];
            const displayedPercentage =
              pendingPercentages[flag.id] ?? flag.rolloutPercentage;
            return (
              <Fragment key={flag.id}>
                <TableRow className="hover:bg-muted/50">
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
                      onCheckedChange={() => handleToggle(flag.id, flag.tier)}
                      disabled={!canToggle || toggling}
                      aria-label={`Toggle ${flag.name}`}
                    />

                    {flag.enabled && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={displayedPercentage}
                          onChange={(e) =>
                            handlePercentageChange(flag.id, Number(e.target.value))
                          }
                          className="h-1.5 w-full cursor-pointer accent-primary"
                          aria-label={`Rollout percentage for ${flag.name}`}
                        />
                        <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                          {displayedPercentage}%
                        </span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>

                {activeNote && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={3} className="pt-0 pb-2 px-4">
                      <div
                        className={`flex items-start justify-between gap-3 rounded-md px-3 py-2 text-sm ${RISK_NOTE_STYLES[activeNote.tier].container}`}
                      >
                        <p className={`leading-snug ${RISK_NOTE_STYLES[activeNote.tier].text}`}>
                          <span className="font-semibold">AI Risk Note: </span>
                          {activeNote.note}
                        </p>
                        <button
                          onClick={() => dismissNote(flag.id)}
                          className={`mt-0.5 shrink-0 opacity-60 hover:opacity-100 ${RISK_NOTE_STYLES[activeNote.tier].text}`}
                          aria-label="Dismiss risk note"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
