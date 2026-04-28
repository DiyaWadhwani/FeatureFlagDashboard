import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  async getAuditLogs() {
    return this.audit.getAuditLogs();
  }

  @Get('summary')
  async getAuditSummary(@Query('refresh') refresh?: string) {
    const text = await this.audit.getAuditSummary(refresh === 'true');
    return { summary: text };
  }
}
