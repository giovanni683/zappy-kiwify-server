export async function handleKiwifyWebhook(req: Request, res: Response) {
  try {
    const event = req.body;
    // Exemplo: salvar evento no banco
    await pool.query(
      'INSERT INTO notification_rules (id, account_id, integration_id, active, event, message) VALUES (UUID(), ?, ?, TRUE, ?, ?)',
      [event.account_id || 'default-account', event.integration_id || 'default-integration', event.event_code || 1, JSON.stringify(event)]
    );
    // Notificar integração (exemplo: via Zenvia)
    await sendZenviaNotification(event);
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

import { Request, Response } from 'express';
import { sendZenviaNotification } from '../services/zenviaService';
import { pool } from '../db';

export async function handleWebhook(req: Request, res: Response) {
  try {
    const notification = req.body;
    await sendZenviaNotification(notification);
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
