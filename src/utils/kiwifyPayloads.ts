export function getKiwifyPayloadAndTemplate(eventType: string, payload: any) {
  const templates: Record<string, string> = {
    boleto_gerado: 'Olá {{primeiroNome}}, seu boleto está disponível em {{urlBoleto}}.',
    pix_gerado: 'Olá {{primeiroNome}}, seu PIX foi gerado! Código: {{codigoPix}}.',
    compra_aprovada: 'Parabéns {{primeiroNome}}, sua compra foi aprovada!',
    compra_recusada: 'Olá {{primeiroNome}}, infelizmente sua compra foi recusada.',
    carrinho_abandonado: 'Olá {{primeiroNome}}, você deixou produtos no carrinho! Aproveite antes que acabe.',
    subscription_late: 'Olá {{primeiroNome}}, sua assinatura está atrasada. Regularize para continuar aproveitando.',
    subscription_canceled: 'Olá {{primeiroNome}}, sua assinatura foi cancelada.',
    compra_reembolsada: 'Olá {{primeiroNome}}, sua compra foi reembolsada.',
    chargeback: 'Olá {{primeiroNome}}, ocorreu um chargeback em sua compra.',
    subscription_renewed: 'Olá {{primeiroNome}}, sua assinatura foi renovada com sucesso!'
  };

  let payloads: Record<string, any> = {};
  switch (eventType) {
    case 'boleto_gerado':
    case 'billet_created':
      payloads = {
        urlBoleto: payload.boleto_URL ?? '',
        codigoBarrasBoleto: payload.boleto_barcode ?? '',
        dataExpiracaoBoleto: payload.boleto_expiry_date ?? '',
        statusPagamento: payload.order_status ?? '',
        nomeCompleto: payload.Customer?.full_name ?? '',
        primeiroNome: payload.Customer?.first_name ?? ''
      };
      break;
    case 'pix_gerado':
    case 'pix_created':
      payloads = {
        codigoPix: payload.pix_code ?? '',
        dataExpiracaoPix: payload.pix_expiration ?? '',
        statusPagamento: payload.order_status ?? '',
        nomeCompleto: payload.Customer?.full_name ?? '',
        primeiroNome: payload.Customer?.first_name ?? ''
      };
      break;
    case 'compra_aprovada':
    case 'order_approved':
    case 'compra_recusada':
    case 'order_rejected':
    case 'compra_reembolsada':
    case 'order_refunded':
    case 'chargeback':
    case 'subscription_late':
    case 'subscription_renewed':
      payloads = {
        statusPagamento: payload.order_status ?? '',
        nomeCompleto: payload.Customer?.full_name ?? '',
        primeiroNome: payload.Customer?.first_name ?? ''
      };
      break;
    case 'carrinho_abandonado':
      if (payload.status === 'abandoned') {
        payloads = {
          nomeCompleto: payload.name ?? '',
          primeiroNome: payload.name?.split(' ')[0] ?? ''
        };
      }
      break;
    default:
      payloads = { ...payload };
      break;
  }

  const template = templates[eventType] || 'Nova notificação do Kiwify!';
  return { payloads, template };
}
