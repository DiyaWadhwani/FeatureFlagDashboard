import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import type { FeatureFlagAudit } from '@prisma/client';

@Injectable()
export class AiService {
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async assessToggleRisk(params: {
    flagName: string;
    tier: string;
    oldValue: boolean;
    newValue: boolean;
    recentHistory: FeatureFlagAudit[];
  }): Promise<string> {
    const { flagName, tier, oldValue, newValue, recentHistory } = params;

    const historyText =
      recentHistory.length > 0
        ? `toggled ${recentHistory.length} times recently`
        : 'no recent toggle history';

    const prompt =
      `Flag: ${flagName} | Tier: ${tier} | Changed: ${oldValue} → ${newValue} | ` +
      `Recent history: ${historyText}. ` +
      `Assess the risk of this change in 2-3 sentences for an operator dashboard. Be concise and direct.`;

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    return 'Risk assessment unavailable.';
  }

  async generateAuditSummary(logs: FeatureFlagAudit[]): Promise<string> {
    if (logs.length === 0) {
      return 'No audit activity recorded yet.';
    }

    const logLines = logs
      .map(
        (l) =>
          `${l.flagName}: ${l.oldValue} → ${l.newValue} via ${l.source} at ${l.updatedAt.toISOString()}`,
      )
      .join('\n');

    const prompt =
      `Here are the last ${logs.length} feature flag audit entries:\n\n${logLines}\n\n` +
      `Summarize this activity in 2-3 sentences of plain English for an operator dashboard. ` +
      `Mention which flags were most active, note any rollbacks, and flag anything unusual.`;

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    return 'Audit summary unavailable.';
  }
}