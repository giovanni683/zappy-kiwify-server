
import { Request, Response } from 'express';
import { sendNotification } from '../services/notificationService';

export async function sendNotificationController(req: Request, res: Response) {
  try {
    const { title, message } = req.body;
    await sendNotification({ title, message });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
