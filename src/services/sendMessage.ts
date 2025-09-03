// Retorna as credenciais (url e token) da Zappy para um accountId
import { prisma } from '../config/prisma';
import { interpolateMessage } from '../utils/interpolateMessage';
// DynamicVariables removido, usar Record<string, any>
import { Zdk } from 'zdk';

// Busca credenciais Zappy para um accountId
export async function getZappyCredentials(accountId?: string): Promise<{ zappyUrl: string, zappyToken: string }> {
  if (accountId) {
    console.log('Buscando integração ZAPPY para accountId:', accountId);
    const integration = await prisma.integration.findFirst({
      where: {
        accountId,
        type: 'ZAPPY'
      }
    });
    console.log('Retorno da integração:', integration);
    if (integration && integration.credentials) {
      const { zappyUrl, zappyToken } = integration.credentials as { zappyUrl: string, zappyToken: string };
      console.log('Credenciais extraídas:', { zappyUrl, zappyToken });
      if (zappyUrl && zappyToken) return { zappyUrl, zappyToken };
    }
  }
  // Fallback para variáveis de ambiente
  const zappyUrl = process.env.ZAPPY_URL || 'https://api.zappy.chat';
  const zappyToken = process.env.ZAPPY_TOKEN || '';
  return { zappyUrl, zappyToken };
}

// Função utilitária para validar número de telefone (precisa ter DDD/DDI e formato internacional)
function isValidPhoneNumber(phone: string): boolean {
  // Aceita formato internacional: +[código país][DDD][número], ex: +5511999999999
  return /^\+\d{12,15}$/.test(phone);
}

// Envia mensagem usando credenciais Zappy da conta
export async function sendMessage(notification: {
  [key: string]: any;
  accountId?: string;
  eventType: string | number;
  variables?: Record<string, any>;
  phone?: string;
  to?: string;
  connectionFrom?: string;
  sector?: string;
  Customer?: { [key: string]: any };
  customer?: { [key: string]: any };
}) {
  try {
    const templates: Record<string | number, string> = {
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
    const template = templates[notification.eventType] || 'Nova notificação do Kiwify!';
    const variables: Record<string, any> = notification.variables || {};
    // Mapeia variáveis do payload para os templates
    const mappedVariables: Record<string, any> = {
      ...variables,
      primeiroNome: variables.primeiroNome || notification.Customer?.first_name || notification.customer?.first_name,
      urlBoleto: variables.urlBoleto || notification.boleto_URL,
      codigoBoleto: variables.codigoBoleto || notification.boleto_barcode,
      statusPedido: variables.statusPedido || notification.order_status,
      codigoPix: variables.codigoPix || notification.pix_code
    };
    const message = interpolateMessage(template, mappedVariables);

    // Captura o número de telefone de diferentes fontes e variações
    let phone = notification.phone || notification.to;
    if (!phone) {
      if (notification.Customer && notification.Customer.mobile) {
        phone = notification.Customer.mobile;
        console.log('Usando Customer.mobile como número de telefone:', phone);
      } else if (notification.customer && notification.customer.mobile) {
        phone = notification.customer.mobile;
        console.log('Usando customer.mobile como número de telefone:', phone);
      }
    }
    // Normaliza número para formato internacional
    if (phone && !phone.startsWith('+')) {
      // Se já começa com 55, só prefixa +
      if (phone.startsWith('55')) {
        phone = '+' + phone;
      } else {
        // Se não, prefixa +55
        phone = '+55' + phone.replace(/^0+/, '');
      }
      console.log('Número normalizado para formato internacional:', phone);
    }
    console.log('Número de telefone capturado:', phone);
    if (!phone || !isValidPhoneNumber(phone)) {
      return {
        success: false,
        error: 'Número de telefone inválido. Certifique-se de que possui DDD/DDI e está no formato internacional (+5511999999999).',
        feedback: {
          zappyConnection: false,
          usedDefaultConnection: false,
          transferredToSector: notification.sector || null
        }
      };
    }
   
    // Busca credenciais Zappy corretas
    const { zappyUrl, zappyToken } = await getZappyCredentials(notification.accountId);
    console.log('Credenciais Zappy utilizadas:', { zappyUrl, zappyToken });
    
    // Instancia Zdk com credenciais da conta
    // Ajuste conforme documentação do Zdk: se espera string, passe apenas o token
    const zdk = new Zdk(zappyUrl, zappyToken);

    const hasZappyConnection = !!notification.connectionFrom;
    const usedDefaultConnection = !notification.connectionFrom;
    const transferredToSector = notification.sector || null;

    // Remove o + do início antes de enviar para o Zappy
    const phoneToSend = phone.startsWith('+') ? phone.slice(1) : phone;

    console.log('Enviando mensagem para:', phoneToSend, 'com dados:', {
      body: message,
      connectionFrom: notification.connectionFrom ? Number(notification.connectionFrom) : 0,
      ticketStrategy: 'create'
    });

    console.log('Preparando para enviar mensagem para:', phoneToSend);
    const response = await zdk.messages.send(
      phoneToSend,
      {
        body: message,
        connectionFrom: notification.connectionFrom ? Number(notification.connectionFrom) : 0,
        ticketStrategy: 'create'
      }
    );
    console.log('Resposta do ZDK (envio de mensagem):', response); // LOG EXTRA
    return {
      success: true,
      response,
      feedback: {
        zappyConnection: hasZappyConnection,
        usedDefaultConnection,
        transferredToSector
      }
    };
  } catch (error) {
    console.error('Erro ao enviar mensagem via ZDK:', error);
  }
}

// Envia mensagem usando credenciais Zappy da conta (exemplo simplificado para depuração)
export async function sendMessageDebug(data: any) {
  console.log('Dados recebidos para envio:', data);

  
  return { success: true, info: 'Envio simulado. Ajuste conforme necessário.' };
}