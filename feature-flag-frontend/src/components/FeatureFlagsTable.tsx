import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
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

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

type ToggleFeatureFlagVars = { id: string };

const GET_FEATURE_FLAGS = gql`
  query GetFeatureFlags {
    featureFlags {
      id
      name
      enabled
      createdAt
      updatedAt
    }
  }
`;

const TOGGLE_FEATURE_FLAG = gql`
  mutation ToggleFeatureFlag($id: ID!) {
    toggleFeatureFlag(id: $id) {
      id
      enabled
    }
  }
`;

export function FeatureFlagsTable() {
  const { data, loading, error } = useQuery<{ featureFlags: FeatureFlag[] }>(
    GET_FEATURE_FLAGS,
  );

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
              <TableCell className="font-mono text-sm text-foreground">
                {flag.name}
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
