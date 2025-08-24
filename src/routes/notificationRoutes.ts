
import { Router } from 'express';
import { sendNotificationController } from '../controllers/notificationController';
import {
  getNotificationRulesController,
  updateNotificationRuleStatusController
} from '../controllers/notificationRuleController';
import { createIntegration, listIntegrations } from '../controllers/integrationController';

const router = Router();

// Send notification
router.post('/send', sendNotificationController);

// Notification rules endpoints
/**
 * @swagger
 * /api/zappy/notification-rules:
 *   get:
 *     summary: Get notification rules (all, active, or inactive)
 *     tags: [NotificationRules]
 */
router.get('/notification-rules', getNotificationRulesController);

/**
 * @swagger
 * /api/zappy/notification-rules/{id}/status:
 *   put:
 *     summary: Update notification rule status
 *     tags: [NotificationRules]
 */
router.put('/notification-rules/:id/status', updateNotificationRuleStatusController);

// Integrations

/**
 * @swagger
 * /api/zappy/integrations:
 *   post:
 *     summary: Cria uma integração Zappy/Kiwify
 *     tags: [Integrations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountId:
 *                 type: string
 *               type:
 *                 type: integer
 *               credentials:
 *                 type: object
 *                 additionalProperties: true
 *             required:
 *               - accountId
 *               - type
 *               - credentials
 *           example:
 *             accountId: "abc123"
 *             type: 1
 *             credentials:
 *               tokenZappy: "token_zappy_aqui"
 *               tokenKiwify: "token_kiwify_aqui"
 *     responses:
 *       201:
 *         description: Integração criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: string
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno
 */
router.post('/integrations', createIntegration);

/**
 * @swagger
 * /api/zappy/integrations:
 *   get:
 *     summary: Lista todas as integrações
 *     tags: [Integrations]
 *     parameters:
 *       - in: query
 *         name: accountId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID da conta para buscar integrações
 *     responses:
 *       200:
 *         description: Lista de integrações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Integration'
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno
 */
router.get('/integrations', listIntegrations);

export default router;
