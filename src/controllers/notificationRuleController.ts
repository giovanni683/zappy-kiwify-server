import { Request, Response } from 'express';
import {
  getNotificationRules,
  updateNotificationRuleStatus,
  createNotificationRule,
  deleteNotificationRule
} from '../models/notificationRuleModel';
import { uuidv7 } from 'uuidv7';
/**
 * Criação de regra de notificação com UUID v7
 */
export async function createNotificationRuleController(req: Request, res: Response) {
  const { integrationId, accountId, active, event, message, adjustments } = req.body;
  if (!integrationId || !accountId || typeof active !== 'boolean' || event === undefined || !message) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes: integrationId, accountId, active, event, message.' });
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
