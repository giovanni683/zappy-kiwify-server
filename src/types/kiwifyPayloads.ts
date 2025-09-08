export type KiwifyCustomer = {
  full_name?: string;
  first_name?: string;
};

export type BoletoPayload = {
  urlBoleto: string;
  codigoBarrasBoleto: string;
  dataExpiracaoBoleto: string;
  statusPagamento: string;
  nomeCompleto: string;
  primeiroNome: string;
  Customer?: KiwifyCustomer;
};

export type PixPayload = {
  codigoPix: string;
  dataExpiracaoPix: string;
  statusPagamento: string;
  nomeCompleto: string;
  primeiroNome: string;
  Customer?: KiwifyCustomer;
};

export type CompraPayload = {
  statusPagamento: string;
  nomeCompleto: string;
  primeiroNome: string;
  Customer?: KiwifyCustomer;
};

export type CarrinhoAbandonadoPayload = {
  nomeCompleto: string;
  primeiroNome: string;
  status?: 'abandoned';
  name?: string;
};

export type KiwifyPayloads =
  | BoletoPayload
  | PixPayload
  | CompraPayload
  | CarrinhoAbandonadoPayload;
