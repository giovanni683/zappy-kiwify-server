import axios from 'axios';
import { prisma } from '../config/prisma';

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
    await prisma.notification.create({
      data: {
        type: 'boleto',
        orderId: payload.order_id,
        orderRef: payload.order_ref,
        orderStatus: payload.order_status,
        paymentMethod: payload.payment_method,
        customerName: payload.Customer?.full_name || '',
        customerEmail: payload.Customer?.email || '',
        customerMobile: formatPhoneNumber(payload.Customer?.mobile || ''),
        createdAt: new Date(payload.created_at),
        webhookEventType: payload.webhook_event_type,
        extra: {
          boletoUrl: payload.boleto_URL,
          boletoBarcode: payload.boleto_barcode,
          boletoExpiryDate: payload.boleto_expiry_date
        }
      }
    });
    const filtered = {
      nome: payload.Customer?.full_name,
      telefone: formatPhoneNumber(payload.Customer?.mobile),
      boletoUrl: payload.boleto_URL
    };
    await sendNotification(filtered);
    await sendZappyNotification(filtered);
  }
  
}

// Boleto
export async function processBoletoEvent(payload: any) {
  const notificationData = {
    type: 'boleto',
    orderId: payload.order_id,
    orderRef: payload.order_ref,
    orderStatus: payload.order_status,
    paymentMethod: payload.payment_method,
    customerName: payload.Customer?.full_name || '',
    customerEmail: payload.Customer?.email || '',
    customerMobile: formatPhoneNumber(payload.Customer?.mobile || ''),
    productId: payload.Product?.product_id || '',
    productName: payload.Product?.product_name || '',
    createdAt: new Date(payload.created_at),
    eventDate: payload.boleto_expiry_date ? new Date(payload.boleto_expiry_date) : null,
    webhookEventType: payload.webhook_event_type,
    extra: {
      boletoBarcode: payload.boleto_barcode,
      boletoUrl: payload.boleto_URL
    }
  };
  await prisma.notification.create({ data: notificationData });
  const zappyPayload = {
    nome: notificationData.customerName,
    telefone: notificationData.customerMobile,
    mensagem: `Olá ${notificationData.customerName}, seu boleto está disponível!`,
    boletoUrl: payload.boleto_URL,
    boletoBarcode: payload.boleto_barcode
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Pix
export async function processPixEvent(payload: any) {
  const notificationData = {
    type: 'pix',
    orderId: payload.order_id,
    orderRef: payload.order_ref,
    orderStatus: payload.order_status,
    paymentMethod: payload.payment_method,
    customerName: payload.Customer?.full_name || '',
    customerEmail: payload.Customer?.email || '',
    customerMobile: formatPhoneNumber(payload.Customer?.mobile || ''),
    productId: payload.Product?.product_id || '',
    productName: payload.Product?.product_name || '',
    createdAt: new Date(payload.created_at),
    eventDate: payload.pix_expiration ? new Date(payload.pix_expiration) : null,
    webhookEventType: payload.webhook_event_type,
    extra: {
      pixCode: payload.pix_code
    }
  };
  await prisma.notification.create({ data: notificationData });
  const zappyPayload = {
    nome: notificationData.customerName,
    telefone: notificationData.customerMobile,
    mensagem: `Olá ${notificationData.customerName}, seu PIX foi gerado!`,
    pixCode: payload.pix_code
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Compra aprovada
export async function processApprovedOrderEvent(payload: any) {
  const notificationData = {
    type: 'compra_aprovada',
    orderId: payload.order_id,
    orderRef: payload.order_ref,
    orderStatus: payload.order_status,
    paymentMethod: payload.payment_method,
    customerName: payload.Customer?.full_name || '',
    customerEmail: payload.Customer?.email || '',
    customerMobile: formatPhoneNumber(payload.Customer?.mobile || ''),
    productId: payload.Product?.product_id || '',
    productName: payload.Product?.product_name || '',
    createdAt: new Date(payload.created_at),
    eventDate: payload.approved_date ? new Date(payload.approved_date) : null,
    webhookEventType: payload.webhook_event_type,
    extra: {}
  };
  await prisma.notification.create({ data: notificationData });
  const zappyPayload = {
    nome: notificationData.customerName,
    telefone: notificationData.customerMobile,
    mensagem: `Parabéns ${notificationData.customerName}, sua compra foi aprovada!`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Compra recusada
export async function processRefusedOrderEvent(payload: any) {
  const notificationData = {
    type: 'compra_recusada',
    orderId: payload.order_id,
    orderRef: payload.order_ref,
    orderStatus: payload.order_status,
    paymentMethod: payload.payment_method,
    customerName: payload.Customer?.full_name || '',
    customerEmail: payload.Customer?.email || '',
    customerMobile: formatPhoneNumber(payload.Customer?.mobile || ''),
    productId: payload.Product?.product_id || '',
    productName: payload.Product?.product_name || '',
    createdAt: new Date(payload.created_at),
    eventDate: null,
    webhookEventType: payload.webhook_event_type,
    extra: {
      cardRejectionReason: payload.card_rejection_reason
    }
  };
  await prisma.notification.create({ data: notificationData });
  const zappyPayload = {
    nome: notificationData.customerName,
    telefone: notificationData.customerMobile,
    mensagem: `Olá ${notificationData.customerName}, infelizmente sua compra foi recusada.`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Carrinho abandonado
export async function processAbandonedCartEvent(payload: any) {
  const notificationData = {
    type: 'carrinho_abandonado',
    orderId: payload.id,
    orderRef: '',
    orderStatus: payload.status,
    paymentMethod: '',
    customerName: payload.name,
    customerEmail: payload.email,
    customerMobile: formatPhoneNumber(payload.phone || ''),
    productId: payload.product_id,
    productName: payload.product_name,
    createdAt: new Date(payload.created_at),
    eventDate: null,
    webhookEventType: 'carrinho_abandonado',
    extra: {
      checkoutLink: payload.checkout_link
    }
  };
  await prisma.notification.create({ data: notificationData });
  const zappyPayload = {
    nome: notificationData.customerName,
    telefone: notificationData.customerMobile,
    mensagem: `Olá ${notificationData.customerName}, você deixou produtos no carrinho! Aproveite antes que acabe.`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Reembolso
export async function processRefundedOrderEvent(payload: any) {
  const notificationData = {
    type: 'reembolso',
    orderId: payload.order_id,
    orderRef: payload.order_ref,
    orderStatus: payload.order_status,
    paymentMethod: payload.payment_method,
    customerName: payload.Customer?.full_name || '',
    customerEmail: payload.Customer?.email || '',
    customerMobile: formatPhoneNumber(payload.Customer?.mobile || ''),
    productId: payload.Product?.product_id || '',
    productName: payload.Product?.product_name || '',
    createdAt: new Date(payload.created_at),
    eventDate: payload.refunded_at ? new Date(payload.refunded_at) : null,
    webhookEventType: payload.webhook_event_type,
    extra: {}
  };
  await prisma.notification.create({ data: notificationData });
  const zappyPayload = {
    nome: notificationData.customerName,
    telefone: notificationData.customerMobile,
    mensagem: `Olá ${notificationData.customerName}, sua compra foi reembolsada.`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Chargeback
export async function processChargebackEvent(payload: any) {
  const notificationData = {
    type: 'chargeback',
    orderId: payload.order_id,
    orderRef: payload.order_ref,
    orderStatus: payload.order_status,
    paymentMethod: payload.payment_method,
    customerName: payload.Customer?.full_name || '',
    customerEmail: payload.Customer?.email || '',
    customerMobile: formatPhoneNumber(payload.Customer?.mobile || ''),
    productId: payload.Product?.product_id || '',
    productName: payload.Product?.product_name || '',
    createdAt: new Date(payload.created_at),
    eventDate: null,
    webhookEventType: payload.webhook_event_type,
    extra: {}
  };
  await prisma.notification.create({ data: notificationData });
  const zappyPayload = {
    nome: notificationData.customerName,
    telefone: notificationData.customerMobile,
    mensagem: `Olá ${notificationData.customerName}, ocorreu um chargeback em sua compra.`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Assinatura cancelada
export async function processCanceledSubscriptionEvent(payload: any) {
  const notificationData = {
    type: 'assinatura_cancelada',
    orderId: payload.order_id,
    orderRef: payload.order_ref,
    orderStatus: payload.order_status,
    paymentMethod: payload.payment_method,
    customerName: payload.Customer?.full_name || '',
    customerEmail: payload.Customer?.email || '',
    customerMobile: formatPhoneNumber(payload.Customer?.mobile || ''),
    productId: payload.Product?.product_id || '',
    productName: payload.Product?.product_name || '',
    createdAt: new Date(payload.created_at),
    eventDate: payload.refunded_at ? new Date(payload.refunded_at) : null,
    webhookEventType: payload.webhook_event_type,
    extra: {
      subscriptionId: payload.subscription_id
    }
  };
  await prisma.notification.create({ data: notificationData });
  const zappyPayload = {
    nome: notificationData.customerName,
    telefone: notificationData.customerMobile,
    mensagem: `Olá ${notificationData.customerName}, sua assinatura foi cancelada.`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Assinatura atrasada
export async function processLateSubscriptionEvent(payload: any) {
  const notificationData = {
    type: 'assinatura_atrasada',
    orderId: payload.order_id,
    orderRef: payload.order_ref,
    orderStatus: payload.order_status,
    paymentMethod: payload.payment_method,
    customerName: payload.Customer?.full_name || '',
    customerEmail: payload.Customer?.email || '',
    customerMobile: formatPhoneNumber(payload.Customer?.mobile || ''),
    productId: payload.Product?.product_id || '',
    productName: payload.Product?.product_name || '',
    createdAt: new Date(payload.created_at),
    eventDate: null,
    webhookEventType: payload.webhook_event_type,
    extra: {
      subscriptionId: payload.subscription_id
    }
  };
  await prisma.notification.create({ data: notificationData });
  const zappyPayload = {
    nome: notificationData.customerName,
    telefone: notificationData.customerMobile,
    mensagem: `Olá ${notificationData.customerName}, sua assinatura está atrasada. Regularize para continuar aproveitando.`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

// Assinatura renovada
export async function processRenewedSubscriptionEvent(payload: any) {
  const notificationData = {
    type: 'assinatura_renovada',
    orderId: payload.order_id,
    orderRef: payload.order_ref,
    orderStatus: payload.order_status,
    paymentMethod: payload.payment_method,
    customerName: payload.Customer?.full_name || '',
    customerEmail: payload.Customer?.email || '',
    customerMobile: formatPhoneNumber(payload.Customer?.mobile || ''),
    productId: payload.Product?.product_id || '',
    productName: payload.Product?.product_name || '',
    createdAt: new Date(payload.created_at),
    eventDate: null,
    webhookEventType: payload.webhook_event_type,
    extra: {
      subscriptionId: payload.subscription_id
    }
  };
  await prisma.notification.create({ data: notificationData });
  const zappyPayload = {
    nome: notificationData.customerName,
    telefone: notificationData.customerMobile,
    mensagem: `Olá ${notificationData.customerName}, sua assinatura foi renovada com sucesso!`
  };
  await axios.post('https://api.zappy.chat/send', zappyPayload);
}

