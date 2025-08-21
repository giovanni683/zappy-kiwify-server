import { Request, Response } from 'express';
import { sendNotification } from '../services/notificationService';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function sendNotificationController(req: Request, res: Response) {
  const { title, message } = req.body;
  if (!title || typeof title !== 'string') {
    console.error('Erro de validação: title inválido');
    return res.status(400).json({ error: 'title é obrigatório e deve ser string.' });
  }
  if (!message || typeof message !== 'string') {
    console.error('Erro de validação: message inválido');
    return res.status(400).json({ error: 'message é obrigatório e deve ser string.' });
  }
  try {
    await sendNotification({ title, message });
    console.log('Notificação enviada via controller.');
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ error: error.message });
  }
}
