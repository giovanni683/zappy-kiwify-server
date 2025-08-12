
import { Request, Response } from 'express';
import { sendZenviaNotification } from '../services/zenviaService';

export async function handleWebhook(req: Request, res: Response) {
  try {
    const notification = req.body;
    await sendZenviaNotification(notification);
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
