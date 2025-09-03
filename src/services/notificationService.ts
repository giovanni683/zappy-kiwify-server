import { sendMessage } from './sendMessage';

function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/^"+/, '').replace(/^\+/, '');
  if (cleaned.startsWith('55')) cleaned = '+' + cleaned;
  else cleaned = '+55' + cleaned.replace(/^0+/, '');
  return cleaned;
}

export async function handleKiwifyWebhook(payload: any) {
  const eventType = payload.webhook_event_type;
  const accountId = payload.account_id || payload.accountId;
  const phone = formatPhoneNumber(payload.Customer?.mobile || payload.phone);

  // Mapeia os dados para o modelo do sendMessage
  const notification = {
    accountId,
    eventType,
    phone,
    variables: {
      primeiroNome: payload.Customer?.first_name || payload.Customer?.full_name || payload.name,
      urlBoleto: payload.boleto_URL,
      codigoBoleto: payload.boleto_barcode,
      codigoPix: payload.pix_code,
      statusPedido: payload.order_status,
      valorBoleto: payload.valor_boleto,
      pixCode: payload.pix_code
    },
    Customer: payload.Customer,
    ...payload
  };
  await sendMessage(notification);
}

// Eventos individuais agora usam sendMessage
export async function processBoletoEvent(payload: any) {
  await handleKiwifyWebhook({ ...payload, webhook_event_type: 'boleto_gerado' });
}
export async function processPixEvent(payload: any) {
  await handleKiwifyWebhook({ ...payload, webhook_event_type: 'pix_gerado' });
}
export async function processApprovedOrderEvent(payload: any) {
  await handleKiwifyWebhook({ ...payload, webhook_event_type: 'compra_aprovada' });
}
export async function processRefusedOrderEvent(payload: any) {
  await handleKiwifyWebhook({ ...payload, webhook_event_type: 'compra_recusada' });
}
export async function processAbandonedCartEvent(payload: any) {
  await handleKiwifyWebhook({ ...payload, webhook_event_type: 'carrinho_abandonado' });
}
export async function processRefundedOrderEvent(payload: any) {
  await handleKiwifyWebhook({ ...payload, webhook_event_type: 'compra_reembolsada' });
}
export async function processChargebackEvent(payload: any) {
  await handleKiwifyWebhook({ ...payload, webhook_event_type: 'chargeback' });
}
export async function processCanceledSubscriptionEvent(payload: any) {
  await handleKiwifyWebhook({ ...payload, webhook_event_type: 'subscription_canceled' });
}
export async function processLateSubscriptionEvent(payload: any) {
  await handleKiwifyWebhook({ ...payload, webhook_event_type: 'subscription_late' });
}
export async function processRenewedSubscriptionEvent(payload: any) {
  await handleKiwifyWebhook({ ...payload, webhook_event_type: 'subscription_renewed' });
}

