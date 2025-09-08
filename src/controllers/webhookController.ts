import { Request, Response } from 'express';
import { sendMessage } from '../services/sendMessage';
import { KiwifyEventType } from '../types/kiwifyEventType';

export async function handleKiwifyWebhook(req: Request, res: Response) {
  const event = req.body;
  const accountId = req.query.account_id || req.query.accountId || event.account_id || event.accountId;
  if (!event || typeof event !== 'object') {
    return res.status(400).json({ error: 'Evento inválido.' });
  }
  if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
    return res.status(400).json({ error: 'account_id é obrigatório, deve ser string e não pode ser vazio.' });
  }
  try {
    let eventType = event.webhook_event_type;
    if (!eventType && event.status) {
      eventType = event.status;
    }
    if (eventType === 'billet_created') eventType = 'boleto_gerado';
    if (eventType === 'pix_created') eventType = 'pix_gerado';
    if (eventType === 'order_approved') eventType = 'compra_aprovada';
    if (eventType === 'order_rejected') eventType = 'compra_recusada';
    if (eventType === 'order_refunded') eventType = 'compra_reembolsada';
    if (eventType === 'chargeback') eventType = 'chargeback';
    if (eventType === 'subscription_canceled') eventType = 'subscription_canceled';
    if (eventType === 'subscription_late') eventType = 'subscription_late';
    if (eventType === 'subscription_renewed') eventType = 'subscription_renewed';
    if (eventType === 'abandoned') eventType = 'carrinho_abandonado';

    let notification;
    switch (eventType) {
      case 'boleto_gerado':
        notification = {
          accountId,
          eventType,
          nome: event.Customer?.first_name || event.Customer?.full_name,
          Customer: event.Customer,
          urlBoleto: event.boleto_URL,
          codigoBoleto: event.boleto_barcode
        };
        break;
      case 'pix_gerado':
        notification = {
          accountId,
          eventType,
          nome: event.Customer?.first_name || event.Customer?.full_name,
          Customer: event.Customer,
          codigoPix: event.pix_code
        };
        break;
      case 'compra_aprovada':
        notification = {
          accountId,
          eventType,
          nome: event.Customer?.first_name || event.Customer?.full_name,
          Customer: event.Customer,
          statusPedido: event.order_status
        };
        break;
      case 'compra_recusada':
        notification = {
          accountId,
          eventType,
          nome: event.Customer?.first_name || event.Customer?.full_name,
          Customer: event.Customer,
          erro: event.error || null
        };
        break;
      case 'carrinho_abandonado':
        notification = {
          accountId,
          eventType: 'carrinho_abandonado',
          nome: event.name,
          telefone: event.phone,
          Customer: event.name ? { first_name: event.name } : undefined
        };
        break;
      case 'subscription_late':
      case 'subscription_canceled':
      case 'subscription_renewed':
        notification = {
          accountId,
          eventType,
          nome: event.Customer?.first_name || event.Customer?.full_name,
          Customer: event.Customer,
          statusPedido: event.order_status
        };
        break;
      case 'compra_reembolsada':
      case 'chargeback':
        notification = {
          accountId,
          eventType,
          nome: event.Customer?.first_name || event.Customer?.full_name,
          Customer: event.Customer,
          statusPedido: event.order_status
        };
        break;
      default:
        notification = {
          accountId,
          eventType,
          nome: event.Customer?.first_name || event.Customer?.full_name,
          Customer: event.Customer
        };
    }
    if (!notification) {
      return res.status(500).json({ error: 'Falha ao montar objeto de notificação.' });
    }
    const result = await sendMessage(notification);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function handleWebhook(req: Request, res: Response) {
  const notification = req.body;
  if (!notification || typeof notification !== 'object') {
    return res.status(400).json({ error: 'Notification inválida.' });
  }
  try {
    await sendMessage(notification);
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
