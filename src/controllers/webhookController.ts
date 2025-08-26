import { Request, Response } from 'express';
import { sendZenviaNotification } from '../services/zenviaService';
import { PrismaClient } from '@prisma/client';
import { uuidv7 } from 'uuidv7';
const prisma = new PrismaClient();

export async function handleKiwifyWebhook(req: Request, res: Response) {
  // Validação dos headers obrigatórios
  const authHeader = req.headers['authorization'];
  const accountHeader = req.headers['x-kiwify-account-id'];
  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({ error: 'Authorization header (Bearer token) obrigatório.' });
  }
  if (!accountHeader || typeof accountHeader !== 'string') {
    return res.status(401).json({ error: 'x-kiwify-account-id header obrigatório.' });
  }
  const event = req.body;
  // Validação básica dos dados do evento
  if (!event || typeof event !== 'object') {
    console.error('Webhook Kiwify: evento inválido');
    return res.status(400).json({ error: 'Evento inválido.' });
  }
  if (!event.account_id || typeof event.account_id !== 'string') {
    console.error('Webhook Kiwify: account_id inválido');
    return res.status(400).json({ error: 'account_id é obrigatório e deve ser string.' });
  }
  if (!event.integration_id || typeof event.integration_id !== 'string') {
    console.error('Webhook Kiwify: integration_id inválido');
    return res.status(400).json({ error: 'integration_id é obrigatório e deve ser string.' });
  }
  try {
    const id = uuidv7();
    await prisma.notificationRule.create({
      data: {
        id,
        accountId: event.account_id,
        integrationId: event.integration_id,
        active: true,
        event: event.event_code || 1,
        message: JSON.stringify(event)
      }
    });
    await sendZenviaNotification(event);
    console.log(`Evento Kiwify registrado para account_id: ${event.account_id}`);
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
    await sendZenviaNotification(notification);
    console.log('Notificação processada via webhook.');
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Erro ao processar webhook:', err);
    res.status(500).json({ error: err.message });
  }
}
