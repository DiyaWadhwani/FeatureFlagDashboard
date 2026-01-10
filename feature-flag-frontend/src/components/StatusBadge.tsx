import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  enabled: boolean;
}

export function StatusBadge({ enabled }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide",
        enabled
          ? "bg-success/15 text-success"
          : "bg-muted text-muted-foreground"
      )}
    >
      {enabled ? "ON" : "OFF"}
    </span>
  );
}
