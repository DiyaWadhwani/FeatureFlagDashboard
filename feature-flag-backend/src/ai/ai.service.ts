import { Injectable } from '@nestjs/common';
import type { FeatureFlagAudit } from '@prisma/client';

@Injectable()
export class AiService {
  async assessToggleRisk(params: {
    flagName: string;
    tier: string;
    oldValue: boolean;
    newValue: boolean;
    recentHistory: FeatureFlagAudit[];
  }): Promise<string> {
    const { flagName, tier, oldValue, newValue } = params;
    const action = newValue ? 'enabled' : 'disabled';
    return `[Mock] ${flagName} (${tier}) was ${action} (${oldValue} → ${newValue}). This is a mock risk assessment — replace with a real Anthropic API call when credits are available.`;
  }

  async generateAuditSummary(logs: FeatureFlagAudit[]): Promise<string> {
    if (logs.length === 0) {
      return '[Mock] No audit activity recorded yet.';
    }

    const uniqueFlags = new Set(logs.map((l) => l.flagName));
    const flagCounts = logs.reduce<Record<string, number>>((acc, l) => {
      acc[l.flagName] = (acc[l.flagName] ?? 0) + 1;
      return acc;
    }, {});
    const [topFlag, topCount] = Object.entries(flagCounts).sort(
      (a, b) => b[1] - a[1],
    )[0];

    const rolledBackFlags = [...uniqueFlags].filter((name) => {
      const flagLogs = logs.filter((l) => l.flagName === name);
      return (
        flagLogs.some((l) => l.oldValue && !l.newValue) &&
        flagLogs.some((l) => !l.oldValue && l.newValue)
      );
    });

    const since = new Date(
      logs[logs.length - 1].updatedAt,
    ).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    let summary =
      `[Mock] ${logs.length} toggle${logs.length !== 1 ? 's' : ''} recorded across ` +
      `${uniqueFlags.size} flag${uniqueFlags.size !== 1 ? 's' : ''} since ${since}. ` +
      `${topFlag} was the most active (${topCount} change${topCount !== 1 ? 's' : ''}). `;

    summary +=
      rolledBackFlags.length > 0
        ? `Potential rollbacks detected on: ${rolledBackFlags.join(', ')}.`
        : 'No rollbacks detected.';

    return summary;
  }
}