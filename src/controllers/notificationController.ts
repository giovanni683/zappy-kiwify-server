import { Request, Response } from 'express';
import { sendNotification } from '../services/notificationService';

export async function sendNotificationController(req: Request, res: Response) {
  const { title, message } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'O campo title é obrigatório, deve ser string e não pode ser vazio.' });
  }
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'O campo message é obrigatório, deve ser string e não pode ser vazio.' });
  }
  try {
    await sendNotification({ title, message });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
