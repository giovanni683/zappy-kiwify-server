import { Request, Response } from 'express';
import { sendNotification } from '../services/notificationService';
import {
  getNotificationRules,
  updateNotificationRuleStatus,
  createNotificationRule,
  deleteNotificationRule
} from '../models/notificationRuleModel';
import { uuidv7 } from 'uuidv7';

// Envio de notificação simples
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

// CRUD de regras de notificação
export async function createNotificationRuleController(req: Request, res: Response) {
  const { integrationId, accountId, active, event, message, adjustments } = req.body;
  if (!integrationId || String(integrationId).trim() === '' ||
      !accountId || String(accountId).trim() === '' ||
      typeof active !== 'boolean' || event === undefined ||
      !message || String(message).trim() === '') {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes ou vazios: integrationId, accountId, active, event, message.' });
  }
  try {
    const id = uuidv7();
    const rule = await createNotificationRule({ id, integrationId, accountId, active, event: Number(event), message, adjustments });
    res.status(201).json({ success: true, rule });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getNotificationRulesController(req: Request, res: Response) {
  try {
    const { status } = req.query;
    if (status && status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ error: 'Invalid status filter.' });
    }
    const rules = await getNotificationRules(status as 'active' | 'inactive');
    res.status(200).json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateNotificationRuleStatusController(req: Request, res: Response) {
  const { id } = req.params;
  const { active } = req.body;
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'active must be boolean.' });
  }
  try {
    const updated = await updateNotificationRuleStatus(id, active);
    res.status(200).json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Notification rule not found.' });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function deleteNotificationRuleController(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await deleteNotificationRule(id);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
