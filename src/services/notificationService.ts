import axios from 'axios';

function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/^\+/, ''); // Remove o + do início
  cleaned = cleaned.replace(/^"+/, '');
  if (cleaned.startsWith('55')) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
}

export async function sendNotification(data: any) {
  try {
    const response = await axios.post('http://localhost:3000/api/notifications', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar notificação para o frontend:', error);
    throw error;
  }
}

export async function sendZappyNotification(data: any) {
  // Exemplo: envia notificação para o sistema da Zappy
  try {
    await axios.post('https://api.zappy.chat/send', data); // ajuste a URL conforme necessário
  } catch (error) {
    console.error('Erro ao enviar notificação para a Zappy:', error);
  }
}

export async function handleKiwifyWebhook(payload: any) {
  const eventType = payload.webhook_event_type;

  if (eventType === 'billet_created') {
    const filtered = {
      nome: payload.Customer?.full_name,
      telefone: formatPhoneNumber(payload.Customer?.mobile),
      boletoUrl: payload.boleto_URL
    };
    await sendNotification(filtered);
    await sendZappyNotification(filtered);
  }
  // Adicione outros eventos conforme necessário, sem persistir no banco
}

// Boleto
export async function processBoletoEvent(payload: any) {
  const zappyPayload = {
    nome: payload.Customer?.full_name,
    telefone: formatPhoneNumber(payload.Customer?.mobile),
    mensagem: `Olá ${payload.Customer?.full_name}, seu boleto está disponível!`,
    boletoUrl: payload.boleto_URL,
    boletoBarcode: payload.boleto_barcode
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Pix
export async function processPixEvent(payload: any) {
  const zappyPayload = {
    nome: payload.Customer?.full_name,
    telefone: formatPhoneNumber(payload.Customer?.mobile),
    mensagem: `Olá ${payload.Customer?.full_name}, seu PIX foi gerado!`,
    pixCode: payload.pix_code
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Compra aprovada
export async function processApprovedOrderEvent(payload: any) {
  const zappyPayload = {
    nome: payload.Customer?.full_name,
    telefone: formatPhoneNumber(payload.Customer?.mobile),
    mensagem: `Parabéns ${payload.Customer?.full_name}, sua compra foi aprovada!`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Compra recusada
export async function processRefusedOrderEvent(payload: any) {
  const zappyPayload = {
    nome: payload.Customer?.full_name,
    telefone: formatPhoneNumber(payload.Customer?.mobile),
    mensagem: `Olá ${payload.Customer?.full_name}, infelizmente sua compra foi recusada.`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Carrinho abandonado
export async function processAbandonedCartEvent(payload: any) {
  const zappyPayload = {
    nome: payload.name,
    telefone: formatPhoneNumber(payload.phone),
    mensagem: `Olá ${payload.name}, você deixou produtos no carrinho! Aproveite antes que acabe.`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Reembolso
export async function processRefundedOrderEvent(payload: any) {
  const zappyPayload = {
    nome: payload.Customer?.full_name,
    telefone: formatPhoneNumber(payload.Customer?.mobile),
    mensagem: `Olá ${payload.Customer?.full_name}, sua compra foi reembolsada.`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Chargeback
export async function processChargebackEvent(payload: any) {
  const zappyPayload = {
    nome: payload.Customer?.full_name,
    telefone: formatPhoneNumber(payload.Customer?.mobile),
    mensagem: `Olá ${payload.Customer?.full_name}, ocorreu um chargeback em sua compra.`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Assinatura cancelada
export async function processCanceledSubscriptionEvent(payload: any) {
  const zappyPayload = {
    nome: payload.Customer?.full_name,
    telefone: formatPhoneNumber(payload.Customer?.mobile),
    mensagem: `Olá ${payload.Customer?.full_name}, sua assinatura foi cancelada.`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Assinatura atrasada
export async function processLateSubscriptionEvent(payload: any) {
  const zappyPayload = {
    nome: payload.Customer?.full_name,
    telefone: formatPhoneNumber(payload.Customer?.mobile),
    mensagem: `Olá ${payload.Customer?.full_name}, sua assinatura está atrasada. Regularize para continuar aproveitando.`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Assinatura renovada
export async function processRenewedSubscriptionEvent(payload: any) {
  const zappyPayload = {
    nome: payload.Customer?.full_name,
    telefone: formatPhoneNumber(payload.Customer?.mobile),
    mensagem: `Olá ${payload.Customer?.full_name}, sua assinatura foi renovada com sucesso!`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

