import { Request, Response } from 'express';
import { sendMessage } from '../services/sendMessage';

export async function handleKiwifyWebhook(req: Request, res: Response) {
  const event = req.body;
  const accountId = req.params.accountId;
  console.log('accountId dos params:', accountId);
  // Validação básica dos dados do evento
  if (!event || typeof event !== 'object') {
    console.error('Webhook Kiwify: evento inválido');
    return res.status(400).json({ error: 'Evento inválido.' });
  }
  console.log(event);
  if (!accountId || typeof accountId !== 'string' || accountId.trim() === '') {
    console.error('Webhook Kiwify: account_id inválido');
    return res.status(400).json({ error: 'account_id é obrigatório, deve ser string e não pode ser vazio.' });
  }
  try {
    // Processa e dispara para Zappy, sem registrar no banco
    await sendMessage({ ...event, accountId });
    console.log(`Evento Kiwify processado para account_id: ${accountId}`);
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Erro ao processar webhook Kiwify:', err);
    res.status(500).json({ error: err.message });
  }
}

export async function handleWebhook(req: Request, res: Response) {
  const notification = req.body;
  if (!notification || typeof notification !== 'object') {
    console.error('Webhook: notification inválida');
    return res.status(400).json({ error: 'Notification inválida.' });
  }
  try {
    await sendMessage(notification);
    console.log('Notificação processada via webhook.');
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Erro ao processar webhook:', err);
    res.status(500).json({ error: err.message });
  }
}
