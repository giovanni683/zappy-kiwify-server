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

    const response = await zdk.messages.send(
      notification.phone || notification.to,
      {
        body: message,
        connectionFrom: notification.connectionFrom || 'default',
        ticketStrategy: 'create'
      }
    );
    return response;
  } catch (error) {
    console.error('Erro ao enviar mensagem Zappy:', error);
    throw error;
  }
}