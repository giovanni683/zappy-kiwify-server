// Retorna as credenciais (url e token) da Zappy para um accountId
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getZappyCredentials(accountId?: string): Promise<{ url: string, token: string }> {
  if (accountId) {
    // Busca integração Zappy para a conta informada
    const integration = await prisma.integration.findFirst({
      where: {
        accountId,
        type: 1 // Supondo que type 1 é Zappy
      }
    });
    if (integration && integration.credentials) {
      // Supondo que credentials tem url e token
      const { url, token } = integration.credentials as { url: string, token: string };
      if (url && token) return { url, token };
    }
  }
  // Fallback para variáveis de ambiente
  const url = process.env.ZAPPY_URL || 'https://api.zappy.chat';
  const token = process.env.ZAPPY_TOKEN || '';
  return { url, token };
}
// Função utilitária para validar número de telefone (precisa ter DDD/DDI e formato internacional)
function isValidPhoneNumber(phone: string): boolean {
  // Aceita formato internacional: +[código país][DDD][número], ex: +5511999999999
  return /^\+\d{12,15}$/.test(phone);
}
import { interpolateMessage } from '../utils/interpolateMessage';
import { DynamicVariables } from '../models/zappyTypes';
import { Zdk } from 'zdk';

const zdk = new Zdk(); // Usa variáveis de ambiente ZAPPY_URL e ZAPPY_TOKEN

export async function sendZenviaNotification(notification: any) {
  try {
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

    const template = templates[notification.eventType] || 'Nova notificação do Kiwify!';
    const variables: DynamicVariables = notification.variables || {};
    const message = interpolateMessage(template, variables);

    const phone = notification.phone || notification.to;
    if (!isValidPhoneNumber(phone)) {
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

    // Verifica se há conexão Zappy
    const hasZappyConnection = !!notification.connectionFrom;
    const usedDefaultConnection = !notification.connectionFrom;
    const transferredToSector = notification.sector || null;

    const response = await zdk.messages.send(
      phone,
      {
        body: message,
        connectionFrom: notification.connectionFrom || 'default',
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