// Retorna as credenciais (url e token) da Zappy para um accountId
import { prisma } from '../config/prisma';
import { ChannelKey } from '../types/channelKey';
import { interpolateMessage } from '../utils/interpolateMessage';
// DynamicVariables removido, usar Record<string, any>
import { Zdk } from 'zdk';

// Busca credenciais Zappy para um accountId
export async function getZappyCredentials(accountId?: string): Promise<{ zappyUrl: string, zappyToken: string }> {
  if (accountId) {
    const integration = await prisma.integration.findFirst({
      where: {
        accountId,
        type: String(ChannelKey.ZAPPY)
      }
    });
    if (integration && integration.credentials) {
      // Corrigido para zappyUrl e zappyToken
      const { zappyUrl, zappyToken } = integration.credentials as { zappyUrl: string, zappyToken: string };
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
  accountId?: string;
  eventType: string | number;
  variables?: Record<string, any>;
  phone?: string;
  to?: string;
  connectionFrom?: string;
  sector?: string;
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
    const message = interpolateMessage(template, variables);

    const phone = notification.phone || notification.to;
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

    // Instancia Zdk com credenciais da conta
    // Ajuste conforme documentação do Zdk: se espera string, passe apenas o token
    const zdk = new Zdk(zappyToken, zappyUrl);

    const hasZappyConnection = !!notification.connectionFrom;
    const usedDefaultConnection = !notification.connectionFrom;
    const transferredToSector = notification.sector || null;

    const response = await zdk.messages.send(
      phone,
      {
        body: message,
        connectionFrom: notification.connectionFrom ? Number(notification.connectionFrom) : 0,
        ticketStrategy: 'create'
      }
    );
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
    console.error('Erro ao enviar mensagem Zappy:', error);
    throw error;
  }
}