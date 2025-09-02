export enum IntegrationType {
  ZAPPY = 1,
  KIWIFY = 2
}

export interface Integration {
  id: string;
  accountId: string;
  type: IntegrationType;
  credentials: any;
}
