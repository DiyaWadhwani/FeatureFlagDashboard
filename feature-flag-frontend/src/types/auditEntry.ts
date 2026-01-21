export type AuditEntry = {
  id: string;
  flagName: string;
  oldValue: boolean;
  newValue: boolean;
  source: string;
  updatedAt: string;
};
