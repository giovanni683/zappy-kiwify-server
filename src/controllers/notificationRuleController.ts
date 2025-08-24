import { Request, Response } from 'express';
import {
  getNotificationRules,
  updateNotificationRuleStatus,
  createNotificationRule,
  deleteNotificationRule
} from '../models/notificationRuleModel';

/**
 * @swagger
 * /api/zappy/notification-rules:
 *   get:
 *     summary: Get notification rules (all, active, or inactive)
 *     tags: [NotificationRules]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by rule status
 *     responses:
 *       200:
 *         description: List of notification rules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotificationRule'
 */
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

/**
 * @swagger
 * /api/zappy/notification-rules/{id}/status:
 *   put:
 *     summary: Update notification rule status
 *     tags: [NotificationRules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification rule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               active:
 *                 type: boolean
 *             required:
 *               - active
 *           example:
 *             active: true
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationRule'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Rule not found
 */
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
