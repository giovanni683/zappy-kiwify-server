export interface NotificationRule {
  id: string;
  integrationId: string;
  accountId: string;
  active: boolean;
  event: number;
  message: string;
  adjustments?: any;
  variables: Record<string, any>;
}
