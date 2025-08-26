import { Request, Response } from 'express';
import { sendNotification } from '../services/notificationService';

export async function sendNotificationController(req: Request, res: Response) {
  const { title, message } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'O campo title é obrigatório e deve ser string.' });
  }
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'O campo message é obrigatório e deve ser string.' });
  }
  try {
    await sendNotification({ title, message });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
