export enum IntegrationType {
  ZAPPY = 1,
  KIWIFY = 1
}

export interface Account {
  id: string; // uuid
  status: number;
  name: string;
}

export interface Integration {
  id: string; // uuid
  accountId: string; // uuid
  type: IntegrationType;
  credential: any; // JSON
}

export interface NotificationRule {
  id: string; // uuid
  integrationId: string; // uuid
  accountId: string; // uuid
  active: boolean;
  event: number;
  message: string;
  adjustments?: any; // JSON
}

export type KiwifyEventType =
  | 'boleto_gerado'
  | 'pix_gerado'
  | 'compra_aprovada'
  | 'compra_recusada'
  | 'carrinho_abandonado'
  | 'subscription_late'
  | 'subscription_canceled'
  | 'compra_reembolsada'
  | 'chargeback'
  | 'subscription_renewed';

export interface DynamicVariables {
  // Dados do cliente
  nomeCompleto?: string;
  primeiroNome?: string;
  // Pagamento
  urlBoleto?: string;
  codigoBarrasBoleto?: string;
  dataExpiracaoBoleto?: string;
  statusPagamento?: string;
  codigoPix?: string;
  dataExpiracaoPix?: string;
}
