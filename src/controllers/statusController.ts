import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
};

export const getStats = (req: Request, res: Response) => {
  // Exemplo: retornar estatísticas estáticas
  res.json({ notificationsSent: 123, integrationsActive: 4 });
};

export const getLogs = (req: Request, res: Response) => {
  // Exemplo: retornar logs estáticos
  res.json({ logs: ['Log de integração', 'Erro de conexão', 'Evento X'] });
};

// Função alternativa para logs (caso algum endpoint use a versão function)
export function getLogsFunction(req: Request, res: Response) {
  res.json({ logs: ['Log de integração', 'Erro de conexão', 'Evento X'] });
}

export const getSupportedEvents = (req: Request, res: Response) => {
  const events = [
    'boleto_gerado',
    'pix_gerado',
    'compra_aprovada',
    'compra_recusada',
    'carrinho_abandonado',
    'subscription_late',
    'subscription_canceled',
    'compra_reembolsada',
    'chargeback',
    'subscription_renewed'
  ];
  res.json({ events });
};

export const getDynamicVariables = (req: Request, res: Response) => {
  const variables = [
    'nomeCompleto',
    'primeiroNome',
    'urlBoleto',
    'codigoBarrasBoleto',
    'dataExpiracaoBoleto',
    'statusPagamento',
    'codigoPix',
    'dataExpiracaoPix'
  ];
  res.json({ variables });
};
