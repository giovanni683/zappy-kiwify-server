import { Request, Response } from 'express';
import { sendNotification } from '../services/notificationService';

/**
 * @swagger
 * /api/zappy/send:
 *   post:
 *     summary: Envia uma notificação
 *     tags: [Notification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *             required:
 *               - title
 *               - message
 *           example:
 *             title: "Novo pedido"
 *             message: "Você recebeu um novo pedido."
 *     responses:
 *       200:
 *         description: Notificação enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno
 */
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
